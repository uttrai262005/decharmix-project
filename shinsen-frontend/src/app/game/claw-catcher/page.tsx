"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./ClawCatcher.module.css";
// === SỬA LỖI 1: THÊM 'FiAward' VÀO IMPORT ===
import {
  FiDatabase,
  FiZap,
  FiLoader,
  FiClock,
  FiHeart,
  FiGift,
  FiKey,
  FiAward,
} from "react-icons/fi";

type GameState = "idle" | "playing" | "dropping" | "won" | "lost";
type PrizeType = "coins" | "voucher" | "nothing";

// Cấu hình game
const GAME_DURATION = 45;
const CLAW_SPEED = 3;
const MAX_MISSES = 3;

// === SỬA LỖI 2: ĐỊNH NGHĨA TYPE RÕ RÀNG ===
// Định nghĩa kiểu dữ liệu cho giải thưởng ban đầu
interface PrizeDefinition {
  id: number;
  type: "coin" | "voucher";
  x: number;
}
// Vị trí các phần thưởng
const prizePositions: PrizeDefinition[] = [
  { id: 1, type: "coin", x: 20 },
  { id: 2, type: "voucher", x: 50 },
  { id: 3, type: "coin", x: 80 },
];
// Định nghĩa kiểu dữ liệu cho giải thưởng trong game (thêm 'isCaught')
interface Prize extends PrizeDefinition {
  isCaught: boolean;
}
// =======================================

export default function ClawCatcherPage() {
  const { user, token, refreshUserStats } = useAuth();
  const [clawPlays, setClawPlays] = useState(0);
  const [userCoins, setUserCoins] = useState(0);

  // State của game
  const [gameState, setGameState] = useState<GameState>("idle");
  const [timer, setTimer] = useState(GAME_DURATION);
  const [misses, setMisses] = useState(0);
  const [prizes, setPrizes] = useState<Prize[]>([]); // <-- Dùng Type 'Prize'

  // State vật lý
  const [clawX, setClawX] = useState(50);
  const [clawY, setClawY] = useState(0);
  const [clawDirection, setClawDirection] = useState(1);
  const [clawMessage, setClawMessage] = useState("");

  // State của API
  const [apiResult, setApiResult] = useState<{
    prize_name: string;
    prize_type: PrizeType;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Lấy số xu và vé
  useEffect(() => {
    if (user) {
      setUserCoins(user.coins);
      fetch("/api/game/stats", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setClawPlays(data.claw_plays || 0);
        });
    }
  }, [user, token]);

  // Dọn dẹp
  const cleanupGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
  };

  // Hàm kết thúc game
  const endGame = (status: "won" | "lost") => {
    cleanupGame();
    setGameState(status);
    if (status === "won") {
      refreshUserStats(); // Cập nhật Xu (nếu trúng)
    }
  };

  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Vòng lặp chính của game
  useEffect(() => {
    // 1. Vòng lặp Timer (Đếm ngược 45s)
    if (gameState === "playing") {
      timerRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            // Hết giờ -> THUA
            endGame("lost");
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }

    // 2. Vòng lặp Game (Di chuyển gắp)
    if (gameState === "playing") {
      gameLoopRef.current = setInterval(() => {
        setClawX((x) => {
          let newX = x + clawDirection * CLAW_SPEED;
          if (newX > 90) {
            // Đụng phải
            setClawDirection(-1);
            newX = 90;
          }
          if (newX < 10) {
            // Đụng trái
            setClawDirection(1);
            newX = 10;
          }
          return newX;
        });
      }, 1000 / 60); // 60 FPS
    }

    // Dọn dẹp chung
    return () => cleanupGame();
  }, [gameState]); // Chỉ phụ thuộc vào 'playing'

  // Hàm Bắt đầu game
  const handleStartGame = async () => {
    if (clawPlays <= 0) return;
    setIsLoading(true);
    setApiResult(null);

    try {
      const response = await fetch("/api/game/claw-play", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Lỗi khi bắt đầu game");

      setApiResult(data);
      setClawPlays((prev) => prev - 1);

      // Reset game
      setTimer(GAME_DURATION);
      setMisses(0);
      setClawX(50);
      setClawY(0);
      setClawDirection(1);
      // === SỬA LỖI 3: DÒNG NÀY SẼ HẾT BÁO ĐỎ ===
      setPrizes(prizePositions.map((p) => ({ ...p, isCaught: false })));
      // ======================================
      setClawMessage("");
      setGameState("playing");
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm "GẮP" (Click)
  const handleDropClaw = () => {
    if (gameState !== "playing") return; // Chỉ cho gắp khi đang chơi

    cleanupGame(); // Dừng di chuyển ngang và timer
    setGameState("dropping"); // Bắt đầu thả gắp
    setClawMessage("");

    // 1. Gắp đi xuống
    setClawY(180); // 180px là đáy

    setTimeout(() => {
      // 2. Kiểm tra va chạm (sau 1s)
      let caughtPrize = null;
      const HITBOX = 8; // Vùng va chạm (8%)

      for (const prize of prizes) {
        if (!prize.isCaught && Math.abs(clawX - prize.x) < HITBOX) {
          caughtPrize = prize;
          break; // Tìm thấy 1 cái
        }
      }

      if (caughtPrize) {
        // === GẮP TRÚNG ===
        setClawMessage("Gắp trúng rồi!");
        setPrizes((prev) =>
          prev.map((p) =>
            p.id === caughtPrize!.id ? { ...p, isCaught: true } : p
          )
        );
        const newScore = prizes.filter((p) => p.isCaught).length + 1;

        // Kiểm tra thắng
        if (newScore === prizePositions.length) {
          setTimeout(() => endGame("won"), 1000); // Chờ 1s rồi thắng
          return;
        }
      } else {
        // === GẮP TRƯỢT ===
        setClawMessage("Trượt rồi!");
        const newMisses = misses + 1;
        setMisses(newMisses);

        // Kiểm tra thua
        if (newMisses >= MAX_MISSES) {
          setTimeout(() => endGame("lost"), 1000); // Chờ 1s rồi thua
          return;
        }
      }

      // 3. Gắp đi lên (sau 1.5s)
      setTimeout(() => {
        setClawY(0); // Gắp đi lên

        // 4. Chơi tiếp (sau 2s)
        setTimeout(() => {
          setGameState("playing"); // Cho phép di chuyển và timer chạy lại
        }, 500); // Chờ gắp về tới nơi
      }, 500); // Chờ 0.5s ở đáy
    }, 1000); // 1s (thời gian gắp đi xuống)
  };

  const resetGame = () => setGameState("idle");

  return (
    <div
      className={styles.pageWrapper}
      onClick={handleDropClaw}
      onKeyDown={(e) => e.key === " " && handleDropClaw()}
      tabIndex={0}
    >
      <div className={styles.container}>
        <h1 className={styles.title}>Gắp Charm Trúng Thưởng</h1>
        <p className={styles.subtitle}>
          Click (hoặc Spacebar) để Gắp! Gắp đủ{" "}
          <strong>{prizePositions.length}</strong> giải trong{" "}
          <strong>{GAME_DURATION}s</strong>.
        </p>

        {/* Thông tin User */}
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <FiDatabase />
            <span>Decharmix Xu:</span>
            <strong>{userCoins.toLocaleString("vi-VN")}</strong>
          </div>
          <div className={styles.statItem}>
            <FiKey />
            <span>Vé chơi:</span>
            <strong>{clawPlays}</strong>
          </div>
        </div>

        {/* Khu vực chơi game */}
        <div className={styles.gameArea}>
          {/* Màn hình chờ (Idle) */}
          {gameState === "idle" && (
            <div className={styles.overlayScreen}>
              <FiZap size={60} color="var(--brand-pink)" />
              <p>Sẵn sàng thử thách căn giờ?</p>
              <button
                className={styles.playButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartGame();
                }}
                disabled={isLoading || clawPlays <= 0}
              >
                {isLoading ? (
                  <FiLoader className={styles.loaderIcon} />
                ) : clawPlays > 0 ? (
                  `Chơi ngay (Tốn 1 vé)`
                ) : (
                  "Bạn đã hết vé"
                )}
              </button>
            </div>
          )}

          {/* Màn hình Thua (Lost) */}
          {gameState === "lost" && (
            <div className={styles.overlayScreen}>
              <span className={styles.resultIcon}>😭</span>
              <h2 className={styles.resultTitle}>Thua Rồi!</h2>
              <p className={styles.resultMessage}>
                {timer === 0 ? "Hết giờ!" : `Bạn đã gắp trượt ${misses} lần!`}{" "}
                Thử lại nhé!
              </p>
              <button
                className={styles.playButton}
                onClick={(e) => {
                  e.stopPropagation();
                  resetGame();
                }}
              >
                Chơi Lại
              </button>
            </div>
          )}

          {/* Màn hình Thắng (Won) */}
          {gameState === "won" && (
            <div className={styles.overlayScreen}>
              <span className={styles.resultIcon}>🎉</span>
              <h2 className={styles.resultTitle}>Bạn Thắng!</h2>
              <p className={styles.resultMessage}>
                {/* === SỬA LỖI 4: HIỂN THỊ ĐÚNG KẾT QUẢ === */}
                {/* Backend game này (70/30) không có "nothing" */}
                {apiResult?.prize_name
                  ? `Chúc mừng! Bạn nhận được ${apiResult.prize_name}!`
                  : "Kỹ năng tuyệt vời!"}
              </p>
              <button
                className={styles.playButton}
                onClick={(e) => {
                  e.stopPropagation();
                  resetGame();
                }}
              >
                Chơi Lại
              </button>
            </div>
          )}

          {/* Vật thể Game */}
          {(gameState === "playing" || gameState === "dropping") && (
            <>
              {/* Cái gắp (Claw) */}
              <div className={styles.clawTrack} />
              <div
                className={styles.clawAssembly}
                style={{
                  left: `${clawX}%`,
                  transform: `translateY(${clawY}px)`,
                }}
              >
                <div className={styles.clawRod} />
                <div className={styles.clawHead}>💖</div>
              </div>

              {/* Thông báo (Trượt/Trúng) */}
              {clawMessage && (
                <div className={styles.clawMessage}>{clawMessage}</div>
              )}

              {/* Các phần thưởng */}
              <div className={styles.prizeArea}>
                {prizes.map(
                  (prize) =>
                    !prize.isCaught && (
                      <div
                        key={prize.id}
                        className={styles.prize}
                        style={{ left: `${prize.x}%` }}
                      >
                        {/* === SỬA LỖI 5: DÒNG NÀY SẼ HẾT BÁO ĐỎ === */}
                        {prize.type === "coin" ? <FiAward /> : <FiGift />}
                      </div>
                    )
                )}
              </div>

              {/* Hiển thị điểm và thời gian */}
              <div className={styles.gameHud}>
                <div>
                  Gắp trượt:{" "}
                  <strong>
                    {misses}/{MAX_MISSES}
                  </strong>
                </div>
                <div className={timer <= 10 ? styles.timerWarning : ""}>
                  Thời gian: <strong>{timer}s</strong>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
