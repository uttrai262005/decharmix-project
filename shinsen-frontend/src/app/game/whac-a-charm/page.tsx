"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./Whac.module.css";
import {
  FiDatabase,
  FiZap,
  FiLoader,
  FiClock,
  FiHeart,
  FiAlertTriangle,
  FiKey,
} from "react-icons/fi";

type GameState = "idle" | "playing" | "won" | "lost";
type PrizeType = "coins" | "nothing";

// Enum cho loại ô
enum TileType {
  Empty,
  Charm,
  Bomb,
}

export default function WhacPage() {
  const { user, token, refreshUserStats } = useAuth();
  const [whacPlays, setWhacPlays] = useState(0);
  const [userCoins, setUserCoins] = useState(0);

  // State của game
  const [gameState, setGameState] = useState<GameState>("idle");
  const [grid, setGrid] = useState<TileType[]>(Array(9).fill(TileType.Empty));
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(30); // 30 giây

  // State của API
  const [apiResult, setApiResult] = useState<{
    prize_name: string;
    prize_type: PrizeType;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Đang gọi API...

  // Ref cho các bộ đếm
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const TARGET_SCORE = 15; // Mục tiêu 15 điểm
  const GAME_DURATION = 30; // 30 giây

  // Lấy số xu và vé
  useEffect(() => {
    if (user) {
      setUserCoins(user.coins);
      fetch("/api/games/stats", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setWhacPlays(data.whac_plays || 0);
        });
    }
  }, [user, token]);

  // Xử lý vòng lặp game (timer và game logic)
  useEffect(() => {
    if (gameState === "playing") {
      // 1. Chạy Timer (đếm ngược 30s)
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

      // 2. Chạy Game Loop (hiện charm/bom)
      gameLoopRef.current = setInterval(() => {
        setGrid((prevGrid) => {
          const newGrid = Array(9).fill(TileType.Empty);
          const charmIndex = Math.floor(Math.random() * 9);
          newGrid[charmIndex] = TileType.Charm;

          // 10% cơ hội xuất hiện bom
          if (Math.random() < 0.1) {
            let bombIndex = Math.floor(Math.random() * 9);
            while (bombIndex === charmIndex) {
              // Đảm bảo bom không đè lên charm
              bombIndex = Math.floor(Math.random() * 9);
            }
            newGrid[bombIndex] = TileType.Bomb;
          }
          return newGrid;
        });
      }, 900); // Tốc độ (900ms)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameState]);

  // Dọn dẹp
  const cleanupGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    setGrid(Array(9).fill(TileType.Empty));
  };

  // Hàm kết thúc game
  const endGame = (status: "won" | "lost") => {
    cleanupGame();
    setGameState(status);
    if (status === "won") {
      refreshUserStats(); // Cập nhật Xu (nếu trúng)
    }
  };

  // Hàm bắt đầu game
  const handleStartGame = async () => {
    if (whacPlays <= 0) return;
    setIsLoading(true);
    setApiResult(null);

    try {
      const response = await fetch("/api/games/whac-play", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Lỗi khi bắt đầu game");

      setApiResult(data);
      setWhacPlays((prev) => prev - 1);

      // Reset game
      setScore(0);
      setTimer(GAME_DURATION);
      setGameState("playing");
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm click vào ô
  const handleTileClick = (index: number) => {
    if (gameState !== "playing") return;

    const tile = grid[index];

    if (tile === TileType.Charm) {
      // === BẤM TRÚNG CHARM ===
      const newScore = score + 1;
      setScore(newScore);

      // Xóa charm đi ngay
      const newGrid = [...grid];
      newGrid[index] = TileType.Empty;
      setGrid(newGrid);

      // KIỂM TRA THẮNG
      if (newScore >= TARGET_SCORE) {
        endGame("won");
      }
    } else if (tile === TileType.Bomb) {
      // === BẤM TRÚNG BOM ===
      endGame("lost");
    }
  };

  // Hàm chơi lại
  const resetGame = () => {
    setGameState("idle");
    setApiResult(null);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>Săn Charm Nhanh Tay</h1>
        <p className={styles.subtitle}>
          Bấm trúng <strong>{TARGET_SCORE}</strong> charm trong{" "}
          <strong>{GAME_DURATION} giây</strong>. Tránh xa bom 💣!
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
            <strong>{whacPlays}</strong>
          </div>
        </div>

        {/* Màn hình chờ (Idle) */}
        {gameState === "idle" && (
          <div className={styles.gameIntro}>
            <FiZap size={60} color="var(--brand-pink)" />
            <p>Sẵn sàng thử thách phản xạ của bạn?</p>
            <button
              className={styles.playButton}
              onClick={handleStartGame}
              disabled={isLoading || whacPlays <= 0}
            >
              {isLoading ? (
                <FiLoader className={styles.loaderIcon} />
              ) : whacPlays > 0 ? (
                `Chơi ngay (Tốn 1 vé)`
              ) : (
                "Bạn đã hết vé"
              )}
            </button>
          </div>
        )}

        {/* Màn hình Thua (Lost) */}
        {gameState === "lost" && (
          <div className={styles.gameResult}>
            <span className={styles.resultIcon}>😭</span>
            <h2 className={styles.resultTitle}>Thua Rồi!</h2>
            <p className={styles.resultMessage}>
              {timer === 0 ? "Hết giờ!" : "Bạn đã bấm nhầm bom!"} Thử lại nhé!
            </p>
            <button className={styles.playButton} onClick={resetGame}>
              Chơi Lại
            </button>
          </div>
        )}

        {/* Màn hình Thắng (Won) */}
        {gameState === "won" && (
          <div className={styles.gameResult}>
            <span className={styles.resultIcon}>🎉</span>
            <h2 className={styles.resultTitle}>Bạn Thắng!</h2>
            <p className={styles.resultMessage}>
              {apiResult?.prize_type === "coins"
                ? `Chúc mừng! Bạn nhận được ${apiResult.prize_name}!`
                : "Phản xạ tuyệt vời! Chúc may mắn lần sau nhé!"}
            </p>
            <button className={styles.playButton} onClick={resetGame}>
              Chơi Lại
            </button>
          </div>
        )}

        {/* Màn hình chơi (Playing) */}
        {gameState === "playing" && (
          <div className={styles.playingArea}>
            <div className={styles.gameInfo}>
              <div className={styles.infoBox}>
                <span>Thời gian</span>
                <strong className={timer <= 10 ? styles.timerWarning : ""}>
                  <FiClock /> {timer}s
                </strong>
              </div>
              <div className={styles.infoBox}>
                <span>Điểm</span>
                <strong>
                  {score} / {TARGET_SCORE}
                </strong>
              </div>
            </div>

            <div className={styles.whacGrid}>
              {grid.map((tile, index) => (
                <div
                  key={index}
                  className={styles.tile}
                  onClick={() => handleTileClick(index)}
                >
                  {tile === TileType.Charm && (
                    <span className={styles.charmIcon}>
                      <FiHeart />
                    </span>
                  )}
                  {tile === TileType.Bomb && (
                    <span className={styles.bombIcon}>
                      <FiAlertTriangle />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
