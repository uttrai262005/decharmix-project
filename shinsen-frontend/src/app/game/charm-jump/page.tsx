"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./CharmJump.module.css";
import {
  FiDatabase,
  FiZap,
  FiLoader,
  FiClock,
  FiHeart,
  FiAlertTriangle,
  FiAward,
  FiKey,
} from "react-icons/fi";

type GameState = "idle" | "countdown" | "playing" | "won" | "lost";
type PrizeType = "coins" | "nothing";

// Cấu hình game
const GAME_DURATION = 45;
const TARGET_SCORE = 10;
const GRAVITY = 0.22; // Tốc độ rơi
const JUMP_STRENGTH = -6;
const CHARM_SIZE = 30;
const OBSTACLE_WIDTH = 50;
const OBSTACLE_GAP = 150;

interface Obstacle {
  id: number;
  x: number;
  topHeight: number;
}
interface Coin {
  id: number;
  x: number;
  y: number;
}

export default function CharmJumpPage() {
  const { user, token, refreshUserStats } = useAuth();
  const [jumpPlays, setJumpPlays] = useState(0);
  const [userCoins, setUserCoins] = useState(0);

  const [gameState, setGameState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(GAME_DURATION);
  const [countdown, setCountdown] = useState(3);

  // State vật lý (cho UI)
  const [charmY, setCharmY] = useState(150);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);

  const [apiResult, setApiResult] = useState<{
    prize_name: string;
    prize_type: PrizeType;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Refs cho Logic Game
  const charmYRef = useRef(150);
  const velocityRef = useRef(0);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const coinsRef = useRef<Coin[]>([]);
  const scoreRef = useRef(0);
  const obstacleCounterRef = useRef(0);
  const coinCounterRef = useRef(0);

  // Lấy số xu và vé
  useEffect(() => {
    if (user) {
      setUserCoins(user.coins);
      fetch("/api/games/stats", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setJumpPlays(data.jump_plays || 0);
        });
    }
  }, [user, token]);

  // Dọn dẹp
  const cleanupGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  // Hàm kết thúc game
  const endGame = (status: "won" | "lost") => {
    if (gameStateRef.current === "playing") {
      cleanupGame();
      setGameState(status);
      if (status === "won") {
        refreshUserStats();
      }
    }
  };

  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Vòng lặp chính của game
  useEffect(() => {
    // 1. Vòng lặp Đếm ngược 3-2-1
    if (gameState === "countdown") {
      countdownRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(countdownRef.current!);
            setGameState("playing"); // BẮT ĐẦU CHƠI
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }

    // 2. Vòng lặp Timer (Đếm ngược 45s)
    if (gameState === "playing") {
      timerRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            // Hết giờ
            endGame("lost");
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }

    // 3. Vòng lặp Game (Vật lý 60fps)
    if (gameState === "playing") {
      gameLoopRef.current = setInterval(() => {
        // Cập nhật vật lý Charm (dùng Refs)
        velocityRef.current += GRAVITY;
        charmYRef.current += velocityRef.current;
        setCharmY(charmYRef.current); // Gửi state từ Ref ra UI

        const gameAreaHeight = gameAreaRef.current?.offsetHeight || 300;

        // Chỉ kiểm tra va chạm SÀN
        if (charmYRef.current > gameAreaHeight - CHARM_SIZE) {
          endGame("lost");
        }

        // Tạo/Di chuyển Bom
        obstacleCounterRef.current++;
        if (obstacleCounterRef.current > 100) {
          obstacleCounterRef.current = 0;
          const topHeight = Math.random() * 100 + 50;
          obstaclesRef.current.push({ id: Date.now(), x: 500, topHeight });
        }
        obstaclesRef.current = obstaclesRef.current
          .map((obs) => ({ ...obs, x: obs.x - 3 }))
          .filter((obs) => obs.x > -OBSTACLE_WIDTH);
        setObstacles([...obstaclesRef.current]);

        // Tạo/Di chuyển Xu
        coinCounterRef.current++;
        if (coinCounterRef.current > 80) {
          coinCounterRef.current = 0;
          const coinY = Math.random() * 150 + 75;
          coinsRef.current.push({ id: Date.now(), x: 500, y: coinY });
        }
        coinsRef.current = coinsRef.current
          .map((coin) => ({ ...coin, x: coin.x - 3 }))
          .filter((coin) => coin.x > -20);
        setCoins([...coinsRef.current]);

        // THU NHỎ HITBOX (VÙNG VA CHẠM)
        const CHARM_HITBOX_PADDING = 5; // Bóp 5px
        const OBSTACLE_HITBOX_PADDING = 4; // Bóp 4px

        const charmRect = {
          x: 50 + CHARM_HITBOX_PADDING,
          y: charmYRef.current + CHARM_HITBOX_PADDING,
          w: CHARM_SIZE - CHARM_HITBOX_PADDING * 2,
          h: CHARM_SIZE - CHARM_HITBOX_PADDING * 2,
        };

        // 1. Va chạm Bom (Sử dụng hitbox đã thu nhỏ)
        for (const obs of obstaclesRef.current) {
          const bottomObsHeight = gameAreaHeight - obs.topHeight - OBSTACLE_GAP;
          const topObsRect = {
            x: obs.x + OBSTACLE_HITBOX_PADDING,
            y: 0,
            w: OBSTACLE_WIDTH - OBSTACLE_HITBOX_PADDING * 2,
            h: obs.topHeight,
          };
          const bottomObsRect = {
            x: obs.x + OBSTACLE_HITBOX_PADDING,
            y: obs.topHeight + OBSTACLE_GAP,
            w: OBSTACLE_WIDTH - OBSTACLE_HITBOX_PADDING * 2,
            h: bottomObsHeight,
          };

          if (
            isColliding(charmRect, topObsRect) ||
            isColliding(charmRect, bottomObsRect)
          ) {
            endGame("lost");
            return;
          }
        }

        // 2. Va chạm Ăn Xu
        coinsRef.current = coinsRef.current.filter((coin) => {
          const coinRect = { x: coin.x, y: coin.y, w: 20, h: 20 };
          if (isColliding(charmRect, coinRect)) {
            scoreRef.current++;
            setScore(scoreRef.current);
            if (scoreRef.current >= TARGET_SCORE) {
              endGame("won");
            }
            return false; // Xóa xu
          }
          return true; // Giữ xu
        });
      }, 1000 / 60); // 60 FPS
    }

    // Dọn dẹp chung
    return () => cleanupGame();
  }, [gameState]); // Chỉ phụ thuộc vào gameState

  // Hàm kiểm tra va chạm AABB
  const isColliding = (rect1: any, rect2: any) => {
    return (
      rect1.x < rect2.x + rect2.w &&
      rect1.x + rect1.w > rect2.x &&
      rect1.y < rect2.y + rect2.h &&
      rect1.h + rect1.y > rect2.y
    );
  };

  // Hàm Bắt đầu game
  const handleStartGame = async () => {
    if (jumpPlays <= 0) return;
    setIsLoading(true);
    setApiResult(null);

    try {
      const response = await fetch("/api/games/jump-play", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Lỗi khi bắt đầu game");

      setApiResult(data);
      setJumpPlays((prev) => prev - 1);

      // Reset game
      setScore(0);
      setTimer(GAME_DURATION);
      setCountdown(3);
      setCharmY(150);
      setObstacles([]);
      setCoins([]);

      // Reset Refs
      charmYRef.current = 150;
      velocityRef.current = 0;
      obstaclesRef.current = [];
      coinsRef.current = [];
      scoreRef.current = 0;
      obstacleCounterRef.current = 0;
      coinCounterRef.current = 0;

      setGameState("countdown");
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm Nhảy (Click)
  const handleJump = () => {
    if (gameState === "playing") {
      velocityRef.current = JUMP_STRENGTH;
    }
  };

  const resetGame = () => setGameState("idle");

  return (
    <div
      className={styles.pageWrapper}
      onClick={handleJump}
      onKeyDown={(e) => e.key === " " && handleJump()}
      tabIndex={0}
    >
      <div className={styles.container}>
        <h1 className={styles.title}>Charm Nhảy Vượt Ải</h1>
        <p className={styles.subtitle}>
          Click (hoặc Spacebar) để Nhảy! Ăn <strong>{TARGET_SCORE} Xu</strong>{" "}
          (✨) trong <strong>{GAME_DURATION}s</strong>.
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
            <strong>{jumpPlays}</strong>
          </div>
        </div>

        {/* Khu vực chơi game */}
        <div className={styles.gameArea} ref={gameAreaRef}>
          {/* Màn hình chờ (Idle) */}
          {gameState === "idle" && (
            <div className={styles.overlayScreen}>
              <FiZap size={60} color="var(--brand-pink)" />
              <p>Sẵn sàng thử thách phản xạ?</p>
              <button
                className={styles.playButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartGame();
                }}
                disabled={isLoading || jumpPlays <= 0}
              >
                {isLoading ? (
                  <FiLoader className={styles.loaderIcon} />
                ) : jumpPlays > 0 ? (
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
                {timer === 0 ? "Hết giờ!" : "Bạn đã đâm trúng bom!"} Thử lại
                nhé!
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
                {apiResult?.prize_type === "coins"
                  ? `Chúc mừng! Bạn nhận được ${apiResult.prize_name}!`
                  : "Kỹ năng tuyệt vời! Chúc may mắn lần sau nhé!"}
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

          {/* GIAO DIỆN COUNTDOWN MỚI */}
          {gameState === "countdown" && (
            <div className={styles.overlayScreen}>
              <div className={styles.countdown}>{countdown}</div>
            </div>
          )}

          {/* Vật thể Game (Chỉ hiện khi đang chơi) */}
          {gameState === "playing" && (
            <>
              {/* Charm (Người chơi) */}
              <div
                className={styles.charm}
                style={{ transform: `translateY(${charmY}px)` }}
              >
                <FiHeart />
              </div>

              {/* Bom (Chướng ngại vật) */}
              {obstacles.map((obs) => (
                <div
                  key={obs.id}
                  style={{ left: `${obs.x}px` }}
                  className={styles.obstacleContainer}
                >
                  {/* === SỬA LỖI TYPO === */}
                  <div
                    className={styles.obstacleTop}
                    style={{ height: `${obs.topHeight}px` }}
                  >
                    <FiAlertTriangle />
                  </div>
                  <div
                    className={styles.obstacleBottom}
                    style={{
                      height: `${
                        (gameAreaRef.current?.offsetHeight || 300) -
                        obs.topHeight -
                        OBSTACLE_GAP
                      }px`,
                    }}
                  >
                    <FiAlertTriangle />
                  </div>
                </div>
              ))}

              {/* Xu (Điểm) */}
              {coins.map((coin) => (
                <div
                  key={coin.id}
                  className={styles.coin}
                  style={{ left: `${coin.x}px`, top: `${coin.y}px` }}
                >
                  <FiAward />
                </div>
              ))}

              {/* Hiển thị điểm và thời gian */}
              <div className={styles.gameHud}>
                <div>
                  Điểm:{" "}
                  <strong>
                    {score}/{TARGET_SCORE}
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
