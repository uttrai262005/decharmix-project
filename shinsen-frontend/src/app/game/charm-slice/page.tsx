"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./CharmSlice.module.css";
import {
  FiDatabase,
  FiZap,
  FiLoader,
  FiHeart,
  FiAlertTriangle,
  FiKey,
  FiXCircle,
} from "react-icons/fi";

type GameState = "idle" | "playing" | "won" | "lost";
type PrizeType = "coins" | "nothing";

enum ItemType {
  Charm,
  Bomb,
}
interface GameItem {
  id: number;
  type: ItemType;
  x: number;
  duration: number;
  isSliced: boolean;
}

interface SliceTrailPoint {
  id: number;
  x: number;
  y: number;
}

const TARGET_SCORE = 20;
const MAX_MISSES = 3;
const SPAWN_RATE = 1000;

export default function CharmSlicePage() {
  const { user, token, refreshUserStats } = useAuth();
  const [slicePlays, setSlicePlays] = useState(0);
  const [userCoins, setUserCoins] = useState(0);

  const gameAreaRef = useRef<HTMLDivElement>(null);

  // State của game
  const [gameState, setGameState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [items, setItems] = useState<GameItem[]>([]);

  const [isSlicing, setIsSlicing] = useState(false);
  const [sliceTrail, setSliceTrail] = useState<SliceTrailPoint[]>([]);

  // State của API
  const [apiResult, setApiResult] = useState<{
    prize_name: string;
    prize_type: PrizeType;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  let itemIdCounter = 0;
  let trailIdCounter = 0;

  // Lấy số xu và vé
  useEffect(() => {
    if (user) {
      setUserCoins(user.coins);
      fetch("/api/games/stats", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setSlicePlays(data.slice_plays || 0);
        });
    }
  }, [user, token]);

  // Dọn dẹp
  const cleanupGame = () => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    setItems([]);
    setSliceTrail([]);
  };

  // === SỬA LỖI 1: CẬP NHẬT REF NGAY LẬP TỨC ===
  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Hàm kết thúc game (Sửa lỗi)
  const endGame = (status: "won" | "lost") => {
    if (gameStateRef.current === "playing") {
      // Set Ref NGAY LẬP TỨC để chặn 'handleMouseMove'
      gameStateRef.current = status;

      cleanupGame();
      setIsSlicing(false);
      setGameState(status);
      if (status === "won") {
        refreshUserStats();
      }
    }
  };
  // ============================================

  // Vòng lặp chính của game
  useEffect(() => {
    if (gameState === "playing") {
      gameLoopRef.current = setInterval(() => {
        const type = Math.random() < 0.2 ? ItemType.Bomb : ItemType.Charm;
        const x = Math.random() * 80 + 10;
        const duration = Math.random() * 2 + 3;

        itemIdCounter++;
        const newItem: GameItem = {
          id: itemIdCounter,
          type,
          x,
          duration,
          isSliced: false,
        };

        setItems((prevItems) => [...prevItems, newItem]);
      }, SPAWN_RATE);
    }

    // Dọn dẹp chung
    return () => cleanupGame();
  }, [gameState]);

  // Hàm Bắt đầu game
  const handleStartGame = async () => {
    if (slicePlays <= 0) return;
    setIsLoading(true);
    setApiResult(null);

    try {
      const response = await fetch("/api/games/slice-play", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Lỗi khi bắt đầu game");

      setApiResult(data);
      setSlicePlays((prev) => prev - 1);

      // Reset game
      setScore(0);
      setMisses(0);
      setItems([]);
      itemIdCounter = 0;
      setSliceTrail([]);
      trailIdCounter = 0;
      setGameState("playing");
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Logic chém (onMouseMove)
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // === SỬA LỖI 2: DÙNG 'gameStateRef' ĐỂ KIỂM TRA ===
      if (
        !isSlicing ||
        gameStateRef.current !== "playing" ||
        !gameAreaRef.current
      ) {
        // setSliceTrail([]);
        return;
      }
      // ============================================

      const gameRect = gameAreaRef.current.getBoundingClientRect();
      const mouseX = e.clientX - gameRect.left;
      const mouseY = e.clientY - gameRect.top;

      // Thêm điểm vào vệt chém
      trailIdCounter++;
      setSliceTrail((prev) => {
        const newTrail = [
          ...prev,
          { id: trailIdCounter, x: mouseX, y: mouseY },
        ];
        return newTrail.slice(-15);
      });

      const itemNodes = gameAreaRef.current.querySelectorAll<HTMLDivElement>(
        `.${styles.gameItem}`
      );

      itemNodes.forEach((node) => {
        const id = parseInt(node.dataset.id || "0");

        const stateItem = items.find((i) => i.id === id);
        if (!stateItem || stateItem.isSliced) {
          return;
        }

        const itemRect = node.getBoundingClientRect();
        const itemX = itemRect.left - gameRect.left;
        const itemY = itemRect.top - gameRect.top;
        const itemSize = itemRect.width;

        if (
          mouseX > itemX &&
          mouseX < itemX + itemSize &&
          mouseY > itemY &&
          mouseY < itemY + itemSize
        ) {
          // === VA CHẠM! ===
          if (stateItem.type === ItemType.Bomb) {
            endGame("lost"); // Sẽ set 'gameStateRef.current = "lost"'
          } else if (stateItem.type === ItemType.Charm) {
            setScore((s) => {
              const newScore = s + 1;
              if (newScore >= TARGET_SCORE) {
                endGame("won"); // Sẽ set 'gameStateRef.current = "won"'
              }
              return newScore;
            });
          }

          // Cập nhật state (chỉ 1 lần)
          setItems((prev) =>
            prev.map((i) => (i.id === id ? { ...i, isSliced: true } : i))
          );
        }
      });
    },
    [isSlicing, items]
  ); // 'items' là cần thiết

  const handleMouseUp = useCallback(() => {
    setIsSlicing(false);
    setSliceTrail([]);
  }, []);

  // Hàm xử lý khi Charm/Bom bay hết (rơi xuống) HOẶC bị chém xong
  const handleAnimationEnd = (
    id: number,
    type: ItemType,
    isSliced: boolean
  ) => {
    if (
      type === ItemType.Charm &&
      !isSliced &&
      gameStateRef.current === "playing"
    ) {
      const newMisses = misses + 1;
      setMisses(newMisses);

      if (newMisses >= MAX_MISSES) {
        endGame("lost");
      }
    }

    // Xóa item
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const resetGame = () => setGameState("idle");

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>Chém Charm Né Bom</h1>
        <p className={styles.subtitle}>
          Giữ chuột trái và "chém" <strong>{TARGET_SCORE}</strong> charm (💖).
          Né Bom (💣) và đừng để lỡ <strong>{MAX_MISSES}</strong> charm!
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
            <strong>{slicePlays}</strong>
          </div>
        </div>

        {/* Khu vực chơi game */}
        <div
          ref={gameAreaRef}
          className={styles.gameArea}
          onMouseDown={() => setIsSlicing(true)}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {/* Vệt chém */}
          {sliceTrail.map((point, index) => (
            <div
              key={point.id}
              className={styles.sliceTrailPoint}
              style={{
                left: point.x,
                top: point.y,
                opacity: index / sliceTrail.length,
              }}
            />
          ))}

          {/* Màn hình chờ (Idle) */}
          {gameState === "idle" && (
            <div className={styles.overlayScreen}>
              <FiZap size={60} color="var(--brand-pink)" />
              <p>Sẵn sàng thử thách phản xạ?</p>
              <button
                className={styles.playButton}
                onClick={handleStartGame}
                disabled={isLoading || slicePlays <= 0}
              >
                {isLoading ? (
                  <FiLoader className={styles.loaderIcon} />
                ) : slicePlays > 0 ? (
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
                {misses >= MAX_MISSES
                  ? `Bạn đã để lỡ ${misses} charm!`
                  : "Bạn đã chém trúng bom!"}
              </p>
              <button className={styles.playButton} onClick={resetGame}>
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
              <button className={styles.playButton} onClick={resetGame}>
                Chơi Lại
              </button>
            </div>
          )}

          {/* Vật thể Game (Chỉ hiện khi đang chơi) */}
          {gameState === "playing" && (
            <>
              {/* Hiển thị điểm và Mạng */}
              <div className={styles.gameHud}>
                <div>
                  Điểm:{" "}
                  <strong>
                    {score}/{TARGET_SCORE}
                  </strong>
                </div>
                <div className={styles.misses}>
                  {Array(MAX_MISSES - misses)
                    .fill(0)
                    .map((_, i) => (
                      <FiHeart key={i} className={styles.heartIcon} />
                    ))}
                  {Array(misses)
                    .fill(0)
                    .map((_, i) => (
                      <FiXCircle key={i} className={styles.heartIconMissed} />
                    ))}
                </div>
              </div>

              {/* Các item (Charm, Bom) */}
              <div className={styles.itemContainer}>
                {items.map((item) => (
                  <div
                    key={item.id}
                    data-id={item.id}
                    className={`${styles.gameItem} 
                                ${
                                  item.isSliced
                                    ? item.type === ItemType.Charm
                                      ? styles.slicedCharm
                                      : styles.slicedBomb
                                    : ""
                                }`}
                    style={{
                      left: `${item.x}%`,
                      animationDuration: `${item.duration}s`,
                    }}
                    onAnimationEnd={() =>
                      handleAnimationEnd(item.id, item.type, item.isSliced)
                    }
                  >
                    {item.type === ItemType.Charm ? (
                      <>
                        <span className={styles.charmHalfLeft}>💖</span>
                        <span className={styles.charmHalfRight}>💖</span>
                        <span className={styles.charmIcon}>💖</span>
                      </>
                    ) : (
                      <span className={styles.bombIcon}>💣</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
