"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import styles from "@/styles/AdminPage.module.css";
import formStyles from "@/styles/AdminForm.module.css";
import gameStyles from "@/styles/AdminGamification.module.css";
import tableStyles from "@/styles/AdminTable.module.css";
import { FiSave, FiAlertCircle, FiPlus, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";

// Định nghĩa kiểu Vòng Quay
interface PrizeSlice {
  id: number;
  slice_index: number;
  name: string;
  type: "xu" | "voucher" | "fail" | string;
  value: string | null;
  probability: number;
}

// Định nghĩa kiểu Game Kỹ năng
interface SkillReward {
  id: number;
  game_key: string;
  reward_type: "xu" | "voucher" | string;
  reward_value: string;
}

// Định nghĩa kiểu Hộp Quà
interface GiftBoxPrize {
  id: number | "new";
  name: string;
  type: "xu" | "voucher" | "ticket" | string;
  value: string;
  image_url: string;
  probability: number;
}

export default function GamificationPage() {
  const { token } = useAuth();

  // States Vòng Quay
  const [prizes, setPrizes] = useState<PrizeSlice[]>([]);
  const [isLoadingWheel, setIsLoadingWheel] = useState(true);
  const [isSavingWheel, setIsSavingWheel] = useState(false);
  const [wheelError, setWheelError] = useState<string | null>(null);

  // States Game Kỹ Năng
  const [skillRewards, setSkillRewards] = useState<SkillReward[]>([]);
  const [isLoadingSkill, setIsLoadingSkill] = useState(true);
  const [isSavingSkill, setIsSavingSkill] = useState(false);

  // States Hộp Quà
  const [giftBoxPrizes, setGiftBoxPrizes] = useState<GiftBoxPrize[]>([]);
  const [isLoadingGiftBox, setIsLoadingGiftBox] = useState(true);
  const [isSavingGiftBox, setIsSavingGiftBox] = useState(false);

  // 1. Tải Cài đặt cho cả 3
  useEffect(() => {
    if (!token) return;
    const fetchWheelData = async () => {
      try {
        setIsLoadingWheel(true);
        const res = await fetch("/api/games/admin/lucky-wheel", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Không thể tải cài đặt Vòng Quay");
        setPrizes(await res.json());
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setIsLoadingWheel(false);
      }
    };
    const fetchSkillData = async () => {
      try {
        setIsLoadingSkill(true);
        const res = await fetch("/api/games/admin/skill-rewards", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Không thể tải cài đặt Game Kỹ năng");
        setSkillRewards(await res.json());
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setIsLoadingSkill(false);
      }
    };
    const fetchGiftBoxData = async () => {
      try {
        setIsLoadingGiftBox(true);
        const res = await fetch("/api/games/admin/gift-box", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Không thể tải cài đặt Hộp Quà");
        setGiftBoxPrizes(await res.json());
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setIsLoadingGiftBox(false);
      }
    };
    fetchWheelData();
    fetchSkillData();
    fetchGiftBoxData();
  }, [token]);

  // === HÀM XỬ LÝ VÒNG QUAY (2 hàm) ===
  const handlePrizeChange = (
    index: number,
    field: keyof PrizeSlice,
    value: string | number
  ) => {
    const newPrizes = [...prizes];
    if (field === "probability")
      newPrizes[index] = {
        ...newPrizes[index],
        [field]: parseFloat(value as string) || 0,
      };
    else newPrizes[index] = { ...newPrizes[index], [field]: value };
    setPrizes(newPrizes);
  };
  const handleSaveWheel = async () => {
    const totalProbability = prizes.reduce((sum, p) => sum + p.probability, 0);
    if (Math.abs(totalProbability - 1.0) > 0.01) {
      setWheelError(
        `Tổng tỷ lệ phải là 100% (hiện tại là ${Math.round(
          totalProbability * 100
        )}%).`
      );
      return;
    }
    setWheelError(null);
    setIsSavingWheel(true);
    try {
      const res = await fetch("/api/games/admin/lucky-wheel", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prizes: prizes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lưu thất bại");
      toast.success("Cập nhật Vòng quay thành công!");
    } catch (err: any) {
      toast.error(err.message);
      setWheelError(err.message);
    } finally {
      setIsSavingWheel(false);
    }
  };

  // === HÀM XỬ LÝ GAME KỸ NĂNG (2 hàm) ===
  const handleSkillRewardChange = (
    index: number,
    field: keyof SkillReward,
    value: string
  ) => {
    const newRewards = [...skillRewards];
    newRewards[index] = { ...newRewards[index], [field]: value };
    setSkillRewards(newRewards);
  };
  const handleSaveSkillRewards = async () => {
    setIsSavingSkill(true);
    try {
      const res = await fetch("/api/games/admin/skill-rewards", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rewards: skillRewards }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lưu thất bại");
      toast.success("Cập nhật thưởng Game Kỹ năng thành công!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSavingSkill(false);
    }
  };

  // === HÀM XỬ LÝ HỘP QUÀ (4 hàm) ===
  const handleAddNewPrize = () => {
    const newPrize: GiftBoxPrize = {
      id: "new",
      name: "Quà Mới",
      type: "xu",
      value: "10",
      image_url: "/placeholder.png",
      probability: 0.1,
    };
    setGiftBoxPrizes([...giftBoxPrizes, newPrize]);
  };
  const handleGiftBoxChange = (
    index: number,
    field: keyof GiftBoxPrize,
    value: string | number
  ) => {
    const newPrizes = [...giftBoxPrizes];
    if (field === "probability")
      newPrizes[index] = {
        ...newPrizes[index],
        [field]: parseFloat(value as string) || 0,
      };
    else newPrizes[index] = { ...newPrizes[index], [field]: value };
    setGiftBoxPrizes(newPrizes);
  };
  const handleSaveGiftBoxPrize = async (index: number) => {
    const prize = giftBoxPrizes[index];
    const isNew = prize.id === "new";
    const endpoint = isNew
      ? "/api/games/admin/gift-box"
      : `/api/games/admin/gift-box/${prize.id}`;
    const method = isNew ? "POST" : "PUT";
    setIsSavingGiftBox(true);
    try {
      const res = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(prize),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lưu thất bại");
      const updatedPrizes = [...giftBoxPrizes];
      updatedPrizes[index] = data;
      setGiftBoxPrizes(updatedPrizes);
      toast.success("Lưu quà tặng thành công!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSavingGiftBox(false);
    }
  };
  const handleDeleteGiftBoxPrize = async (index: number) => {
    const prize = giftBoxPrizes[index];
    if (prize.id === "new") {
      setGiftBoxPrizes(giftBoxPrizes.filter((_, i) => i !== index));
      return;
    }
    if (!confirm(`Bạn có chắc muốn xóa quà "${prize.name}"?`)) return;
    try {
      const res = await fetch(`/api/games/admin/gift-box/${prize.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xóa thất bại");
      setGiftBoxPrizes(giftBoxPrizes.filter((_, i) => i !== index));
      toast.success("Xóa quà tặng thành công!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const totalProbWheel = prizes.reduce((sum, p) => sum + p.probability, 0);
  const totalProbGiftBox = giftBoxPrizes.reduce(
    (sum, p) => sum + p.probability,
    0
  );

  const getGameName = (key: string) => {
    const names: { [key: string]: string } = {
      memory_match: "Lật Hình Trí Nhớ",
      whac_a_charm: "Săn Charm Nhanh Tay",
      charm_jump: "Charm Nhảy Vượt Ải",
      charm_slice: "Chém Charm Né Bom",
    };
    return names[key] || key;
  };

  return (
    <div>
      <h1 className={styles.pageTitle}>Quản lý Gamification</h1>

      {/* === PHẦN 1: VÒNG QUAY MAY MẮN === */}
      <div className={styles.header}>
        <h2 className={styles.pageSubtitle}>1. Vòng Quay May Mắn</h2>
        <button
          onClick={handleSaveWheel}
          className={tableStyles.createButton}
          disabled={isSavingWheel}
        >
          <FiSave /> {isSavingWheel ? "Đang lưu..." : "Lưu Cài Đặt Vòng Quay"}
        </button>
      </div>
      {wheelError && (
        <div className={gameStyles.errorBox}>
          <FiAlertCircle /> {wheelError}
        </div>
      )}

      <div className={formStyles.card}>
        <h3 className={formStyles.cardTitle}>Cài đặt 8 Múi Quay</h3>
        <table className={gameStyles.prizeTable}>
          <thead>
            <tr>
              <th>Múi</th>
              <th>Tên Hiển Thị</th>
              <th>Loại</th>
              <th>Giá trị (Code/Xu)</th>
              <th>Tỷ lệ (0-1)</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingWheel ? (
              <tr>
                <td colSpan={5}>Đang tải...</td>
              </tr>
            ) : (
              prizes.map((prize, index) => (
                <tr key={prize.id}>
                  <td>#{prize.slice_index + 1}</td>
                  <td>
                    <input
                      type="text"
                      value={prize.name}
                      onChange={(e) =>
                        handlePrizeChange(index, "name", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <select
                      value={prize.type}
                      onChange={(e) =>
                        handlePrizeChange(index, "type", e.target.value)
                      }
                    >
                      <option value="xu">Xu</option>
                      <option value="voucher">Voucher</option>
                      <option value="fail">Trượt (Fail)</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={prize.value || ""}
                      onChange={(e) =>
                        handlePrizeChange(index, "value", e.target.value)
                      }
                      placeholder={
                        prize.type === "xu" ? "VD: 100" : "VD: CODE10K"
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={prize.probability}
                      onChange={(e) =>
                        handlePrizeChange(index, "probability", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4}>Tổng Tỷ Lệ (Phải = 1)</td>
              <td
                className={
                  Math.abs(totalProbWheel - 1.0) > 0.01
                    ? gameStyles.totalError
                    : gameStyles.totalOk
                }
              >
                {totalProbWheel.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* === PHẦN 2: GAME KỸ NĂNG === */}
      <div className={styles.header} style={{ marginTop: "2.5rem" }}>
        <h2 className={styles.pageSubtitle}>2. Phần thưởng Game Kỹ Năng</h2>
        <button
          onClick={handleSaveSkillRewards}
          className={tableStyles.createButton}
          disabled={isSavingSkill}
        >
          <FiSave /> {isSavingSkill ? "Đang lưu..." : "Lưu Thưởng Game Kỹ Năng"}
        </button>
      </div>
      <div className={formStyles.card}>
        <h3 className={formStyles.cardTitle}>Cài đặt Thưởng khi Thắng</h3>
        <table className={gameStyles.prizeTable}>
          <thead>
            <tr>
              <th>Tên Game</th>
              <th>Loại Thưởng</th>
              <th>Giá trị (Code/Xu)</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingSkill ? (
              <tr>
                <td colSpan={3}>Đang tải...</td>
              </tr>
            ) : (
              skillRewards.map((game, index) => (
                <tr key={game.id}>
                  <td>
                    <strong>{getGameName(game.game_key)}</strong>
                  </td>
                  <td>
                    <select
                      value={game.reward_type}
                      onChange={(e) =>
                        handleSkillRewardChange(
                          index,
                          "reward_type",
                          e.target.value
                        )
                      }
                    >
                      <option value="xu">Xu</option>
                      <option value="voucher">Voucher</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={game.reward_value}
                      onChange={(e) =>
                        handleSkillRewardChange(
                          index,
                          "reward_value",
                          e.target.value
                        )
                      }
                      placeholder={
                        game.reward_type === "xu" ? "VD: 50" : "VD: CODEWIN"
                      }
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* === PHẦN 3: HỘP QUÀ BÍ ẨN === */}
      <div className={styles.header} style={{ marginTop: "2.5rem" }}>
        <h2 className={styles.pageSubtitle}>3. Hộp Quà Bí Ẩn</h2>
        <button
          onClick={handleAddNewPrize}
          className={tableStyles.createButton}
          style={{ backgroundColor: "#10b981" }}
        >
          <FiPlus /> Thêm Quà Mới
        </button>
      </div>
      {Math.abs(totalProbGiftBox - 1.0) > 0.01 && (
        <div
          className={gameStyles.errorBox}
          style={{ backgroundColor: "#fffbeb", color: "#d97706" }}
        >
          <FiAlertCircle /> Tổng tỷ lệ Hộp Quà đang là{" "}
          {Math.round(totalProbGiftBox * 100)}%. Hệ thống sẽ tự động điều chỉnh
          khi người chơi mở.
        </div>
      )}
      <div className={formStyles.card}>
        <h3 className={formStyles.cardTitle}>Danh sách Vật phẩm trong Hộp</h3>
        <table className={gameStyles.prizeTable}>
          <thead>
            <tr>
              <th>Tên Hiển Thị</th>
              <th>Loại</th>
              <th>Giá trị (Code/Xu/Vé)</th>
              <th>Link Ảnh</th>
              <th>Tỷ lệ (0-1)</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingGiftBox ? (
              <tr>
                <td colSpan={6}>Đang tải...</td>
              </tr>
            ) : (
              giftBoxPrizes.map((prize, index) => (
                <tr key={prize.id === "new" ? `new-${index}` : prize.id}>
                  <td>
                    <input
                      type="text"
                      value={prize.name}
                      onChange={(e) =>
                        handleGiftBoxChange(index, "name", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <select
                      value={prize.type}
                      onChange={(e) =>
                        handleGiftBoxChange(index, "type", e.target.value)
                      }
                    >
                      {/* === SỬA LỖI TYPO TẠI ĐÂY === */}
                      <option value="xu">Xu</option>
                      {/* ========================== */}
                      <option value="voucher">Voucher</option>
                      <option value="ticket">Vé Game (Ticket)</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={prize.value}
                      onChange={(e) =>
                        handleGiftBoxChange(index, "value", e.target.value)
                      }
                      placeholder="VD: 100, CODE10K, spin_tickets"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={prize.image_url}
                      onChange={(e) =>
                        handleGiftBoxChange(index, "image_url", e.target.value)
                      }
                      placeholder="/rewards/ten-anh.png"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={prize.probability}
                      onChange={(e) =>
                        handleGiftBoxChange(
                          index,
                          "probability",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td>
                    <div className={gameStyles.actionGroup}>
                      <button
                        onClick={() => handleSaveGiftBoxPrize(index)}
                        className={gameStyles.saveButton}
                        disabled={isSavingGiftBox}
                      >
                        <FiSave />
                      </button>
                      <button
                        onClick={() => handleDeleteGiftBoxPrize(index)}
                        className={gameStyles.deleteButton}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
