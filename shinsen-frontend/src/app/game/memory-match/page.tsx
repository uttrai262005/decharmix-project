"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./MemoryMatch.module.css";
import { FiDatabase, FiKey, FiZap, FiLoader, FiClock } from "react-icons/fi";
import ReactCardFlip from "react-card-flip";

// --- Dữ liệu 6 cặp thẻ (Dùng icon cho nhẹ) ---
const cardIcons = ["🍓", "🌸", "💖", "✨", "🎀", "💎"];

// Hàm tạo và xáo trộn 12 thẻ
const generateShuffledDeck = () => {
  const deck = [...cardIcons, ...cardIcons] // 12 thẻ
    .map((icon, index) => ({
      id: index,
      icon: icon,
      isFlipped: false,
      isMatched: false,
    }))
    .sort(() => Math.random() - 0.5); // Xáo trộn
  return deck;
};

type CardType = {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
};

type GameState = "idle" | "playing" | "won" | "lost";
type PrizeType = "coins" | "nothing";

export default function MemoryMatchPage() {
  const { user, token, refreshUserStats } = useAuth();
  const [memoryPlays, setMemoryPlays] = useState(0);
  const [userCoins, setUserCoins] = useState(0);

  // State của game
  const [gameState, setGameState] = useState<GameState>("idle");
  const [deck, setDeck] = useState<CardType[]>(generateShuffledDeck());
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(60); // 60 giây

  // State của API
  const [apiResult, setApiResult] = useState<{
    prize_name: string;
    prize_type: PrizeType;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Đang gọi API...
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
          setMemoryPlays(data.memory_plays || 0);
        });
    }
  }, [user, token]);

  // Bộ đếm thời gian
  useEffect(() => {
    if (gameState === "playing" && timer > 0) {
      timerRef.current = setTimeout(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0 && gameState === "playing") {
      // Hết giờ -> THUA
      setGameState("lost");
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gameState, timer]);

  // Hàm bắt đầu game
  const handleStartGame = async () => {
    if (memoryPlays <= 0) return;
    setIsLoading(true);
    setApiResult(null);

    try {
      const response = await fetch("/api/game/memory-play", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Lỗi khi bắt đầu game");

      // Thành công! Backend đã trừ vé và quyết định giải
      setApiResult(data); // Lưu giải thưởng (ẩn)
      setMemoryPlays((prev) => prev - 1);

      // Reset game
      setDeck(generateShuffledDeck());
      setFlippedIndices([]);
      setMatchedCount(0);
      setMoves(0);
      setTimer(60); // Reset timer
      setGameState("playing"); // Bắt đầu chơi
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm lật thẻ
  const handleCardClick = (index: number) => {
    // Không cho click nếu: đang lật 2 thẻ, thẻ đã lật/khớp, game chưa bắt đầu
    if (
      flippedIndices.length === 2 ||
      deck[index].isFlipped ||
      gameState !== "playing"
    ) {
      return;
    }

    // Lật thẻ
    const newDeck = [...deck];
    newDeck[index].isFlipped = true;
    setDeck(newDeck);

    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    // Khi lật đủ 2 thẻ, kiểm tra
    if (newFlippedIndices.length === 2) {
      setMoves((m) => m + 1);
      const [firstIndex, secondIndex] = newFlippedIndices;

      if (deck[firstIndex].icon === deck[secondIndex].icon) {
        // === TRÙNG KHỚP ===
        const newMatchedCount = matchedCount + 2;
        setMatchedCount(newMatchedCount);

        // Cập nhật thẻ là đã khớp
        newDeck[firstIndex].isMatched = true;
        newDeck[secondIndex].isMatched = true;
        setDeck(newDeck);

        setFlippedIndices([]); // Reset

        // KIỂM TRA THẮNG (lật đủ 12 thẻ)
        if (newMatchedCount === 12) {
          setGameState("won");
          if (timerRef.current) clearTimeout(timerRef.current);
          refreshUserStats(); // Cập nhật Xu (nếu trúng)
        }
      } else {
        // === KHÔNG KHỚP ===
        // Úp 2 thẻ lại sau 1 giây
        setTimeout(() => {
          const resetDeck = [...deck];
          resetDeck[firstIndex].isFlipped = false;
          resetDeck[secondIndex].isFlipped = false;
          setDeck(resetDeck);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  // Reset toàn bộ game
  const resetGame = () => {
    setGameState("idle");
    setApiResult(null);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>Lật Hình Đổi Thưởng</h1>
        <p className={styles.subtitle}>
          Tìm 6 cặp thẻ giống nhau trong 60 giây để nhận thưởng!
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
            <strong>{memoryPlays}</strong>
          </div>
        </div>

        {/* Màn hình chờ (Idle) */}
        {gameState === "idle" && (
          <div className={styles.gameIntro}>
            <FiZap size={60} color="var(--brand-pink)" />
            <p>Sẵn sàng thử thách trí nhớ của bạn?</p>
            <button
              className={styles.playButton}
              onClick={handleStartGame}
              disabled={isLoading || memoryPlays <= 0}
            >
              {isLoading ? (
                <FiLoader className={styles.loaderIcon} />
              ) : memoryPlays > 0 ? (
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
            <h2 className={styles.resultTitle}>Hết Giờ!</h2>
            <p className={styles.resultMessage}>
              Tiếc quá, bạn đã không hoàn thành kịp. Thử lại nhé!
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
                : "Bạn giỏi quá! Chúc may mắn lần sau nhé!"}
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
                <strong>
                  <FiClock /> {timer}s
                </strong>
              </div>
              <div className={styles.infoBox}>
                <span>Lượt lật</span>
                <strong>{moves}</strong>
              </div>
            </div>

            <div className={styles.cardGrid}>
              {deck.map((card, index) => (
                <ReactCardFlip
                  key={card.id}
                  isFlipped={card.isFlipped}
                  flipDirection="horizontal"
                >
                  {/* Mặt úp */}
                  <div
                    className={styles.cardBack}
                    onClick={() => handleCardClick(index)}
                  >
                    ?
                  </div>
                  {/* Mặt ngửa */}
                  <div
                    className={`${styles.cardFront} ${
                      card.isMatched ? styles.matched : ""
                    }`}
                  >
                    {card.icon}
                  </div>
                </ReactCardFlip>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
