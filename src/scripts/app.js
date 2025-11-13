import confetti from 'canvas-confetti';

// ============ VIETNAM <3 ============
class TimeHelper {
  static getVietnamTime() {
    const now = new Date();
    return new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  }

  static getVietnamHour() {
    return this.getVietnamTime().getHours();
  }

  static getVietnamDateOnly() {
    const vn = this.getVietnamTime();
    return new Date(vn.getFullYear(), vn.getMonth(), vn.getDate());
  }
}

// ============ STORAGE MANAGER ============
class StorageManager {
  constructor() {
    this.keys = {
      foods: 'homnayangi_foods',
      history: 'homnayangi_history',
      stats: 'homnayangi_stats',
      achievements: 'homnayangi_achievements',
      settings: 'homnayangi_settings',
    };
    this.initializeStorage();
  }

  initializeStorage() {
    const defaultFoods = [
      'Phở bò',
      'Bún bò',
      'Cơm tấm',
      'Bánh mì',
      'Bún riêu',
      'Hủ tiếu',
      'Mì Quảng',
      'Cơm gà',
      'Bánh xèo',
      'Gỏi cuốn',
    ];

    if (!localStorage.getItem(this.keys.foods)) {
      this.setFoods(defaultFoods);
    }

    if (!localStorage.getItem(this.keys.stats)) {
      this.setStats({
        streak: 0,
        points: 0,
        totalSuggestions: 0,
        lastSuggestionDate: null,
      });
    }

    if (!localStorage.getItem(this.keys.achievements)) {
      this.setAchievements({
        first: false,
        streak3: false,
        streak7: false,
        streak14: false,
        streak30: false,
        explorer7: false,
        explorer14: false,
        explorer30: false,
        collector20: false,
        collector35: false,
        collector75: false,
        collector150: false,
        variety: false,
        dedicated: false,
        perfectweek: false,
      });
    }

    if (!localStorage.getItem(this.keys.history)) {
      this.setHistory([]);
    }

    if (!localStorage.getItem(this.keys.settings)) {
      this.setSettings({
        autoFreeze: true,
        reminders: {
          enabled: false,
          breakfast: true,
          lunch: true,
          dinner: true,
          timezone: 'Asia/Ho_Chi_Minh',
        },
      });
    }
  }

  getFoods() {
    return JSON.parse(localStorage.getItem(this.keys.foods)) || [];
  }

  setFoods(foods) {
    localStorage.setItem(this.keys.foods, JSON.stringify(foods));
  }

  addFood(food) {
    const foods = this.getFoods();
    if (!foods.includes(food)) {
      foods.push(food);
      this.setFoods(foods);
      return true;
    }
    return false;
  }

  deleteFood(food) {
    const foods = this.getFoods();
    const filtered = foods.filter((f) => f !== food);
    this.setFoods(filtered);
  }

  getHistory() {
    return JSON.parse(localStorage.getItem(this.keys.history)) || [];
  }

  setHistory(history) {
    localStorage.setItem(this.keys.history, JSON.stringify(history));
  }

  addHistory(food) {
    const history = this.getHistory();
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const vietnamTime = TimeHelper.getVietnamTime();
    history.unshift({
      id,
      food,
      timestamp: vietnamTime.getTime(),
      date: vietnamTime.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
    });
    if (history.length > 30) history.pop();
    this.setHistory(history);
  }

  getStats() {
    return JSON.parse(localStorage.getItem(this.keys.stats));
  }

  setStats(stats) {
    localStorage.setItem(this.keys.stats, JSON.stringify(stats));
  }

  updateStats(updates) {
    const stats = this.getStats();
    this.setStats({ ...stats, ...updates });
  }

  getAchievements() {
    return JSON.parse(localStorage.getItem(this.keys.achievements));
  }

  setAchievements(achievements) {
    localStorage.setItem(this.keys.achievements, JSON.stringify(achievements));
  }

  unlockAchievement(key) {
    const achievements = this.getAchievements();
    if (!achievements[key]) {
      achievements[key] = true;
      this.setAchievements(achievements);
      return true;
    }
    return false;
  }

  getSettings() {
    return JSON.parse(localStorage.getItem(this.keys.settings));
  }

  setSettings(settings) {
    localStorage.setItem(this.keys.settings, JSON.stringify(settings));
  }

  updateSettings(updates) {
    const current = this.getSettings();
    const merged = { ...current };
    for (const key in updates) {
      if (updates[key] && typeof updates[key] === 'object' && !Array.isArray(updates[key])) {
        merged[key] = { ...current[key], ...updates[key] };
      } else {
        merged[key] = updates[key];
      }
    }
    this.setSettings(merged);
  }
}

// ============ SOUND MANAGER ============
class SoundManager {
  constructor() {
    this.audioContext = null;
    this.initialized = false;
  }

  initAudio() {
    if (!this.initialized) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    }
  }

  noteToFrequency(note) {
    const notes = {
      C4: 261.63,
      D4: 293.66,
      E4: 329.63,
      F4: 349.23,
      G4: 392.0,
      A4: 440.0,
      B4: 493.88,
      C5: 523.25,
      D5: 587.33,
      E5: 659.25,
      F5: 698.46,
      G5: 783.99,
      A5: 880.0,
      B5: 987.77,
      C6: 1046.5,
    };
    return notes[note] || 523.25;
  }

  playTone(frequency, duration, startTime = 0) {
    this.initAudio();

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    const now = this.audioContext.currentTime + startTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  play(type) {
    try {
      switch (type) {
        case 'shuffle':
          this.playTone(this.noteToFrequency('G4'), 0.15, 0);
          this.playTone(this.noteToFrequency('C5'), 0.15, 0.08);
          break;

        case 'select':
          this.playTone(this.noteToFrequency('C5'), 0.15, 0);
          this.playTone(this.noteToFrequency('E5'), 0.15, 0.1);
          this.playTone(this.noteToFrequency('G5'), 0.15, 0.2);
          break;

        case 'click':
          this.playTone(this.noteToFrequency('C5'), 0.05, 0);
          break;

        case 'add':
          this.playTone(this.noteToFrequency('D5'), 0.1, 0);
          this.playTone(this.noteToFrequency('G5'), 0.1, 0.08);
          break;

        case 'delete':
          this.playTone(this.noteToFrequency('G4'), 0.1, 0);
          this.playTone(this.noteToFrequency('D4'), 0.15, 0.08);
          break;

        case 'achievement':
          this.playTone(this.noteToFrequency('C5'), 0.15, 0);
          this.playTone(this.noteToFrequency('E5'), 0.15, 0.1);
          this.playTone(this.noteToFrequency('G5'), 0.15, 0.2);
          this.playTone(this.noteToFrequency('C6'), 0.3, 0.3);
          break;

        default:
          this.playTone(this.noteToFrequency('C5'), 0.1, 0);
          break;
      }
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }

  dispose() {
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// ============ CONFETTI MANAGER (canvas-confetti) ============
class ConfettiManager {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.confetti = confetti.create(this.canvas, {
      resize: true,
      useWorker: true,
    });
  }

  launch() {
    const colors = ['#FFD900', '#FF4B4B', '#58CC02', '#1CB0F6', '#FF6B9D'];
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: colors,
      shapes: ['square', 'circle'],
      ticks: 300,
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        colors: colors,
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }

  launchFirework() {
    const duration = 2000;
    const end = Date.now() + duration;
    const colors = ['#58CC02', '#89e219', '#FFD900'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }
}

// ============ TOAST MANAGER ============
class ToastManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  show(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    };

    toast.innerHTML = `
      <div class="toast-icon">${icons[type]}</div>
      <div class="toast-message">${message}</div>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideInRight 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// ============ CARD SHUFFLE MANAGER ============
class CardShuffleManager {
  constructor(containerId, storage) {
    this.container = document.getElementById(containerId);
    this.storage = storage;
    this.currentCards = [];
    this.selectedCard = null;
    this.isShuffling = false;

    // Food emojis mapping - safe emojis only
    this.foodEmojis = {
      Phở: '🍜',
      'Phở bò': '🍜',
      'Phở gà': '🍜',
      'Bún bò': '🍜',
      'Bún riêu': '🍜',
      'Bún chả': '🍜',
      'Bún thịt nướng': '🍜',
      'Bún mọc': '🍜',
      'Hủ tiếu': '🍜',
      'Mì Quảng': '🍜',
      'Cao lầu': '🍜',
      'Cơm tấm': '🍚',
      'Cơm gà': '🍚',
      'Cơm chiên': '🍚',
      'Cơm sườn': '🍚',
      'Bánh mì': '🥖',
      'Bánh xèo': '🥞',
      'Bánh cuốn': '🥟',
      'Bánh bao': '🥟',
      'Gỏi cuốn': '🥗',
      Nem: '🍢',
      'Chả giò': '🍢',
      Lẩu: '🍲',
      Xôi: '🍚',
      Chè: '🍨',
      'Gà rán': '🍗',
      'Gà nướng': '🍗',
      'Bò kho': '🍖',
      'Thịt kho': '🍖',
      Cá: '🐟',
      Tôm: '🦐',
      Mực: '🦑',
      Pizza: '🍕',
      Burger: '🍔',
      Sushi: '🍣',
      Ramen: '🍜',
      Pasta: '🍝',
      Salad: '🥗',
      Steak: '🥩',
      Sandwich: '🥪',
    };
  }

  getSmartSuggestions(count = 6) {
    const foods = this.storage.getFoods();

    if (foods.length === 0) {
      return [];
    }

    if (foods.length <= count) {
      return [...foods];
    }

    const history = this.storage.getHistory();
    const recentFoods = history.slice(0, 15).map((h) => h.food);

    const frequencyMap = new Map();
    history.forEach((h) => {
      frequencyMap.set(h.food, (frequencyMap.get(h.food) || 0) + 1);
    });

    const hour = TimeHelper.getVietnamHour();
    const mealContext = this.getMealContext(hour);

    const scoredFoods = foods.map((food) => {
      let score = 100;

      // 1. RECENCY PENALTY - Recent dishes get heavily penalized
      const recentIndex = recentFoods.indexOf(food);
      if (recentIndex !== -1) {
        const recencyPenalty = (15 - recentIndex) * 8;
        score -= recencyPenalty;
      }

      // 2. FREQUENCY PENALTY - Frequently eaten dishes get penalized
      const frequency = frequencyMap.get(food) || 0;
      if (frequency > 0) {
        const frequencyPenalty = Math.log(frequency + 1) * 8;
        score -= frequencyPenalty;
      }

      // 3. MEAL TIME BONUS - Dishes suitable for meal time get priority
      const mealBonus = this.getMealBonus(food, mealContext);
      score += mealBonus;

      // 4. CATEGORY DIVERSITY - Bonus for dishes from rarely seen categories
      const category = this.getFoodCategory(food);
      const recentCategories = recentFoods.slice(0, 8).map((f) => this.getFoodCategory(f));
      const categoryCount = recentCategories.filter((c) => c === category).length;
      if (categoryCount === 0) {
        score += 15;
      } else {
        score -= categoryCount * 5;
      }

      // 5. CONTROLLED RANDOMNESS
      score += Math.random() * 25;

      return { food, score, category };
    });

    scoredFoods.sort((a, b) => b.score - a.score);

    const selected = [];
    const categoryCount = new Map();
    const maxSameCategory = Math.ceil(count * 0.4);

    for (const item of scoredFoods) {
      if (selected.length >= count) break;

      const catCount = categoryCount.get(item.category) || 0;
      if (catCount < maxSameCategory) {
        selected.push(item.food);
        categoryCount.set(item.category, catCount + 1);
      }
    }

    if (selected.length < count) {
      const remaining = scoredFoods
        .filter((item) => !selected.includes(item.food))
        .slice(0, count - selected.length);
      selected.push(...remaining.map((item) => item.food));
    }

    return selected;
  }

  // Detect meal context based on hour
  getMealContext(hour) {
    if (hour >= 5 && hour < 10) return 'breakfast';
    if (hour >= 10 && hour < 14) return 'lunch';
    if (hour >= 14 && hour < 17) return 'snack';
    if (hour >= 17 && hour < 22) return 'dinner';
    return 'late-night';
  }

  getMealBonus(food, mealContext) {
    const normalized = food.toLowerCase();

    switch (mealContext) {
      case 'breakfast':
        if (
          normalized.includes('bánh mì') ||
          normalized.includes('phở') ||
          normalized.includes('xôi') ||
          normalized.includes('cháo') ||
          normalized.includes('bánh cuốn') ||
          normalized.includes('bánh bao')
        ) {
          return 20;
        }
        return 0;

      case 'lunch':
        if (
          normalized.includes('cơm') ||
          normalized.includes('bún') ||
          normalized.includes('mì') ||
          normalized.includes('hủ tiếu') ||
          normalized.includes('miến')
        ) {
          return 20;
        }
        return 0;

      case 'dinner':
        if (
          normalized.includes('lẩu') ||
          normalized.includes('nướng') ||
          normalized.includes('cơm') ||
          normalized.includes('bò kho')
        ) {
          return 15;
        }
        return 0;

      case 'snack':
        if (
          normalized.includes('chè') ||
          normalized.includes('bánh') ||
          normalized.includes('gỏi') ||
          normalized.includes('nem')
        ) {
          return 15;
        }
        return 0;

      default:
        return 0;
    }
  }

  getFoodCategory(food) {
    const normalized = food.toLowerCase();

    if (normalized.includes('phở')) return 'phở';
    if (normalized.includes('bún')) return 'bún';
    if (normalized.includes('mì') || normalized.includes('miến')) return 'mì';
    if (normalized.includes('hủ') || normalized.includes('tiếu')) return 'hủ-tiếu';
    if (normalized.includes('cơm')) return 'cơm';
    if (normalized.includes('xôi')) return 'xôi';
    if (normalized.includes('cháo')) return 'cháo';
    if (normalized.includes('bánh mì')) return 'bánh-mì';
    if (normalized.includes('bánh')) return 'bánh';
    if (normalized.includes('lẩu')) return 'lẩu';
    if (normalized.includes('nướng')) return 'nướng';
    if (normalized.includes('gỏi') || normalized.includes('salad')) return 'gỏi';
    if (normalized.includes('chè') || normalized.includes('tráng miệng')) return 'tráng-miệng';
    if (normalized.includes('nem') || normalized.includes('chả')) return 'nem-chả';
    if (
      normalized.includes('pizza') ||
      normalized.includes('burger') ||
      normalized.includes('pasta')
    )
      return 'western';

    return 'other';
  }

  getEmoji(foodName) {
    const normalizedName = foodName.toLowerCase().trim();

    const exactMatch = Object.keys(this.foodEmojis).find(
      (key) => key.toLowerCase() === normalizedName,
    );
    if (exactMatch) {
      return this.foodEmojis[exactMatch];
    }

    const keywords = {
      'phở bò': '🍜',
      'phở gà': '🍜',
      'Bún bò': '🍜',
      'bún riêu': '🍜',
      'bún chả': '🍢',
      'cơm tấm': '🍚',
      'Cơm gà': '🍚',
      'cơm chiên': '🍚',
      'bánh mì': '🥖',
      'bánh xèo': '🥞',
      'bánh cuốn': '🥟',
      'hủ tiếu': '🍜',
      'mì quảng': '🍜',
      'chả giò': '🍤',
      'gỏi cuốn': '🌯',
      'nem rán': '🍤',
      phở: '🍜',
      bún: '🍜',
      mì: '🍜',
      miến: '🍜',
      hủ: '🍜',
      tiếu: '🍜',
      cơm: '🍚',
      xôi: '🍚',
      cháo: '🍲',
      bánh: '🥐',
      gà: '🍗',
      vịt: '🦆',
      bò: '🥩',
      heo: '🍖',
      lợn: '🍖',
      thịt: '🍖',
      sườn: '🍖',
      cá: '🐟',
      tôm: '🦐',
      mực: '🦑',
      ốc: '🐚',
      lẩu: '🍲',
      chè: '🍨',
      nem: '🍤',
      chả: '🍤',
      gỏi: '🥗',
      salad: '🥗',
      pizza: '🍕',
      burger: '🍔',
      sushi: '🍣',
      ramen: '🍜',
      pasta: '🍝',
      steak: '🥩',
      sandwich: '🥪',
    };

    for (const [keyword, emoji] of Object.entries(keywords)) {
      if (normalizedName.includes(keyword)) {
        return emoji;
      }
    }

    if (normalizedName.includes('nướng') || normalizedName.includes('nương')) return '🍖';
    if (normalizedName.includes('chiên') || normalizedName.includes('rán')) return '🍗';
    if (normalizedName.includes('kho')) return '🍲';
    if (normalizedName.includes('cuốn')) return '🌯';
    if (normalizedName.includes('xào')) return '🍝';
    if (normalizedName.includes('luộc')) return '🥘';
    if (normalizedName.includes('hấp')) return '🥘';
    if (normalizedName.includes('canh') || normalizedName.includes('súp')) return '🍲';

    if (normalizedName.includes('trái cây') || normalizedName.includes('hoa quả')) return '🍎';
    if (normalizedName.includes('rau')) return '🥬';
    if (normalizedName.includes('trứng')) return '🥚';
    if (normalizedName.includes('sữa')) return '🥛';
    if (normalizedName.includes('nước')) return '🧃';
    if (normalizedName.includes('cà phê') || normalizedName.includes('cafe')) return '☕';
    if (normalizedName.includes('trà') || normalizedName.includes('tea')) return '🍵';

    return '🍽️';
  }

  render(foods = null, faceDown = true) {
    if (!foods) {
      foods = this.getSmartSuggestions();
    }

    this.currentCards = foods;
    this.container.innerHTML = '';

    if (foods.length === 0) {
      this.renderEmpty();
      return;
    }

    foods.forEach((food, index) => {
      const card = document.createElement('div');
      card.className = `food-card ${faceDown ? 'face-down' : 'face-up'}`;
      card.dataset.food = food;
      card.style.animationDelay = `${index * 0.05}s`;

      const emoji = this.getEmoji(food);

      card.innerHTML = `
        <div class="card-emoji">${emoji}</div>
        <div class="card-name">${food}</div>
      `;

      setTimeout(() => {
        card.style.animationDelay = '';
      }, 500 + index * 50);

      if (faceDown) {
        this.addCardTouchSupport(card, food);
      }

      this.container.appendChild(card);
    });
  }

  addCardTouchSupport(card, food) {
    let touchStarted = false;
    let handled = false;

    const onPress = (e) => {
      if (this.isShuffling) return;
      touchStarted = e.type === 'touchstart';
      handled = false;
    };

    const handleCardClick = () => {
      if (this.isShuffling || handled) return;
      handled = true;

      this.handleCardFlip(card, food);

      setTimeout(() => {
        if (window.app) {
          window.app.handleCardSelect(food);
        }
      }, 600);
    };

    const onRelease = (e) => {
      if (this.isShuffling) return;
      if (e.cancelable) e.preventDefault();
      if (!touchStarted || e.type === 'touchend') {
        handleCardClick();
      }
    };

    card.addEventListener('mousedown', onPress);
    card.addEventListener('touchstart', onPress, { passive: true });
    card.addEventListener('mouseup', onRelease);
    card.addEventListener('touchend', onRelease, { passive: false });
    card.addEventListener('click', (e) => {
      if (!touchStarted) {
        handleCardClick();
      }
    });
  }

  renderEmpty() {
    this.container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🍽️</div>
        <div class="empty-text">Chưa có món ăn nào!</div>
        <div class="empty-hint">Nhấn nút ➕ để thêm món mới</div>
      </div>
    `;
    this.currentCards = [];
  }

  handleCardFlip(cardElement, food) {
    if (this.isShuffling) return;

    if (this.selectedCard) return;

    cardElement.classList.remove('face-down');
    cardElement.classList.add('face-up');

    this.selectedCard = food;

    this.storage.addHistory(food);

    const allCards = this.container.querySelectorAll('.food-card');
    allCards.forEach((c) => {
      c.style.pointerEvents = 'none';
    });

    setTimeout(() => {
      cardElement.classList.add('selected');
    }, 1000);
  }

  handleCardClick(cardElement, food) {
    if (this.isShuffling) return;

    this.selectedCard = food;

    const allCards = this.container.querySelectorAll('.food-card');
    allCards.forEach((c) => c.classList.remove('selected'));
    cardElement.classList.add('selected');
  }

  async shuffle(onComplete) {
    if (this.isShuffling) return;

    this.isShuffling = true;
    this.selectedCard = null;

    const cards = this.container.querySelectorAll('.food-card');

    // Fade out cards (no flip to prevent showing positions)
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.8)';
      }, index * 30);
    });

    await new Promise((resolve) => setTimeout(resolve, 400));

    // Re-render with new positions
    this.render(null, true);

    this.isShuffling = false;

    if (onComplete) {
      onComplete();
    }
  }

  getSelectedCard() {
    return this.selectedCard;
  }

  reset() {
    this.selectedCard = null;
    const allCards = this.container.querySelectorAll('.food-card');
    allCards.forEach((c) => c.classList.remove('selected'));
  }
}

// ============ MODAL MANAGER ============
class ModalManager {
  constructor() {
    this.modals = {
      add: document.getElementById('addModal'),
      list: document.getElementById('listModal'),
      history: document.getElementById('historyModal'),
      achievements: document.getElementById('achievementsModal'),
      settings: document.getElementById('settingsModal'),
      about: document.getElementById('aboutModal'),
    };

    this.setupCloseHandlers();
  }

  // Smart event listener for both PC and Mobile
  addSmartEventListener(element, callback) {
    if (!element) return;
    let touchStarted = false;
    const onPress = (e) => {
      touchStarted = e.type === 'touchstart';
    };
    const onRelease = (e) => {
      if (e.cancelable) e.preventDefault();
      if (!touchStarted || e.type === 'touchend') {
        callback(e);
      }
    };
    element.addEventListener('mousedown', onPress);
    element.addEventListener('touchstart', onPress, { passive: true });
    element.addEventListener('mouseup', onRelease);
    element.addEventListener('touchend', onRelease, { passive: false });
    element.addEventListener('click', (e) => {
      if (!touchStarted) callback(e);
    });
  }

  setupCloseHandlers() {
    // Add modal
    this.addSmartEventListener(document.getElementById('closeAddModal'), () => this.close('add'));
    this.addSmartEventListener(document.querySelector('#addModal .modal-overlay'), () =>
      this.close('add'),
    );

    // List modal
    this.addSmartEventListener(document.getElementById('closeListModal'), () => this.close('list'));
    this.addSmartEventListener(document.querySelector('#listModal .modal-overlay'), () =>
      this.close('list'),
    );

    this.addSmartEventListener(document.getElementById('closeHistoryModal'), () =>
      this.close('history'),
    );
    this.addSmartEventListener(document.querySelector('#historyModal .modal-overlay'), () =>
      this.close('history'),
    );

    this.addSmartEventListener(document.getElementById('closeAchievementsModal'), () =>
      this.close('achievements'),
    );
    this.addSmartEventListener(document.querySelector('#achievementsModal .modal-overlay'), () =>
      this.close('achievements'),
    );

    this.addSmartEventListener(document.getElementById('closeSettingsModal'), () =>
      this.close('settings'),
    );
    this.addSmartEventListener(document.querySelector('#settingsModal .modal-overlay'), () =>
      this.close('settings'),
    );

    this.addSmartEventListener(document.getElementById('closeAboutModal'), () =>
      this.close('about'),
    );
    this.addSmartEventListener(document.querySelector('#aboutModal .modal-overlay'), () =>
      this.close('about'),
    );
  }

  open(modalName) {
    const modal = this.modals[modalName];
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  close(modal) {
    if (typeof modal === 'string') {
      modal = this.modals[modal];
    }
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  closeAll() {
    Object.values(this.modals).forEach((modal) => this.close(modal));
  }
}

// ============ ACHIEVEMENT MANAGER ============
class AchievementManager {
  constructor(storage, confetti, sound, toast) {
    this.storage = storage;
    this.confetti = confetti;
    this.sound = sound;
    this.toast = toast;

    this.definitions = {
      first: {
        name: 'Bắt Đầu',
        icon: '🎉',
        desc: 'Chào mừng bạn đến với hành trình ẩm thực! 🍜',
        tier: 'basic',
      },

      streak3: {
        name: 'Khởi Đầu',
        icon: '🔥',
        desc: 'Quay lại 3 ngày liên tục - Bạn đang nghiện rồi đấy!',
        tier: 'bronze',
      },
      streak7: {
        name: 'Kiên Trì',
        icon: '🔥',
        desc: 'Cả tuần không bỏ bữa - Bạn là fan trung thành!',
        tier: 'silver',
      },
      streak14: {
        name: 'Quyết Tâm',
        icon: '🔥',
        desc: '2 tuần liên tiếp - Dedication level: PRO!',
        tier: 'gold',
      },
      streak30: {
        name: 'Huyền Thoại',
        icon: '👑',
        desc: 'Cả tháng không ngừng nghỉ - Bạn là HUYỀN THOẠI!',
        tier: 'legend',
      },

      explorer7: {
        name: 'Thám Hiểm',
        icon: '🧭',
        desc: 'Thử 7 món khác nhau - Dạ dày phiêu lưu đấy!',
        tier: 'silver',
      },
      explorer14: {
        name: 'Mạo Hiểm',
        icon: '🗺️',
        desc: 'Chinh phục 14 món - Không gì cản nổi bạn!',
        tier: 'gold',
      },
      explorer30: {
        name: 'Nhà Khám Phá',
        icon: '🌟',
        desc: '30 món khác nhau - Bạn là nhà thám hiểm ẩm thực!',
        tier: 'legend',
      },

      collector20: {
        name: 'Sưu Tầm',
        icon: '📝',
        desc: 'Bộ sưu tập 20 món - Bạn biết mình thích gì rồi!',
        tier: 'bronze',
      },
      collector35: {
        name: 'Sành Ăn',
        icon: '👨‍🍳',
        desc: '35 món trong túi - Menu đa dạng quá trời!',
        tier: 'silver',
      },
      collector75: {
        name: 'Chuyên Gia',
        icon: '🎓',
        desc: '75 món ơi là 75 - Bạn là bách khoa toàn thư!',
        tier: 'gold',
      },
      collector150: {
        name: 'Đại Sư',
        icon: '💎',
        desc: '150 món luôn - Respect! Bạn là ĐẠI SƯ!',
        tier: 'legend',
      },

      variety: {
        name: 'Đa Dạng',
        icon: '🌈',
        desc: 'Nếm thử 20 món khác nhau - Miệng không biết chán!',
        tier: 'gold',
      },
      dedicated: {
        name: 'Tận Tâm',
        icon: '⭐',
        desc: 'Hoạt động 50 ngày - Cống hiến quá đỉnh!',
        tier: 'legend',
      },
      perfectweek: {
        name: 'Tuần Hoàn Hảo',
        icon: '✨',
        desc: 'Check-in đủ 7 ngày trong tuần - Tuần nào cũng vậy!',
        tier: 'gold',
      },
    };
  }

  check(stats) {
    const achievements = this.storage.getAchievements();
    const history = this.storage.getHistory();
    const foods = this.storage.getFoods();
    let newUnlocks = [];

    if (!achievements.first && stats.totalSuggestions >= 1) {
      if (this.storage.unlockAchievement('first')) newUnlocks.push('first');
    }

    if (!achievements.streak3 && stats.streak >= 3) {
      if (this.storage.unlockAchievement('streak3')) newUnlocks.push('streak3');
    }
    if (!achievements.streak7 && stats.streak >= 7) {
      if (this.storage.unlockAchievement('streak7')) newUnlocks.push('streak7');
    }
    if (!achievements.streak14 && stats.streak >= 14) {
      if (this.storage.unlockAchievement('streak14')) newUnlocks.push('streak14');
    }
    if (!achievements.streak30 && stats.streak >= 30) {
      if (this.storage.unlockAchievement('streak30')) newUnlocks.push('streak30');
    }

    if (!achievements.collector20 && foods.length >= 20) {
      if (this.storage.unlockAchievement('collector20')) newUnlocks.push('collector20');
    }
    if (!achievements.collector35 && foods.length >= 35) {
      if (this.storage.unlockAchievement('collector35')) newUnlocks.push('collector35');
    }
    if (!achievements.collector75 && foods.length >= 75) {
      if (this.storage.unlockAchievement('collector75')) newUnlocks.push('collector75');
    }
    if (!achievements.collector150 && foods.length >= 150) {
      if (this.storage.unlockAchievement('collector150')) newUnlocks.push('collector150');
    }

    const uniqueDaysWithDifferentFood = this.countUniqueDaysWithDifferentFood(history);
    if (!achievements.explorer7 && uniqueDaysWithDifferentFood >= 7) {
      if (this.storage.unlockAchievement('explorer7')) newUnlocks.push('explorer7');
    }
    if (!achievements.explorer14 && uniqueDaysWithDifferentFood >= 14) {
      if (this.storage.unlockAchievement('explorer14')) newUnlocks.push('explorer14');
    }
    if (!achievements.explorer30 && uniqueDaysWithDifferentFood >= 30) {
      if (this.storage.unlockAchievement('explorer30')) newUnlocks.push('explorer30');
    }

    const uniqueFoods = new Set(history.map((h) => h.food));
    if (!achievements.variety && uniqueFoods.size >= 20) {
      if (this.storage.unlockAchievement('variety')) newUnlocks.push('variety');
    }

    // Dedicated - 50 ngày hoạt động
    const activeDays = new Set(
      history.map((h) => {
        const date = new Date(h.timestamp);
        return date.toDateString();
      }),
    ).size;
    if (!achievements.dedicated && activeDays >= 50) {
      if (this.storage.unlockAchievement('dedicated')) newUnlocks.push('dedicated');
    }

    if (!achievements.perfectweek && this.hasCompletedWeek(history)) {
      if (this.storage.unlockAchievement('perfectweek')) newUnlocks.push('perfectweek');
    }

    if (newUnlocks.length > 0) {
      newUnlocks.forEach((key) => {
        const def = this.definitions[key];
        if (def) {
          this.confetti.launchFirework();
          this.sound.play('achievement');
          this.toast.show(`Mở khóa: ${def.name}!`, 'success');
        }
      });
    }

    return newUnlocks.length > 0;
  }

  countUniqueDaysWithDifferentFood(history) {
    const dayMap = new Map();

    history.forEach((item) => {
      const date = new Date(item.timestamp);
      const dateKey = date.toDateString();

      if (!dayMap.has(dateKey)) {
        dayMap.set(dateKey, new Set());
      }
      dayMap.get(dateKey).add(item.food);
    });

    return dayMap.size;
  }

  hasCompletedWeek(history) {
    if (history.length === 0) return false;

    const dayMap = new Map();
    history.forEach((item) => {
      const date = new Date(item.timestamp);
      const dateKey = date.toDateString();
      dayMap.set(dateKey, true);
    });

    const dates = Array.from(dayMap.keys())
      .map((d) => new Date(d))
      .sort((a, b) => b - a);

    for (let i = 0; i <= dates.length - 7; i++) {
      let isConsecutive = true;
      const startDate = dates[i];

      for (let j = 1; j < 7; j++) {
        const expectedDate = new Date(startDate);
        expectedDate.setDate(expectedDate.getDate() - j);
        const expectedKey = expectedDate.toDateString();

        if (!dayMap.has(expectedKey)) {
          isConsecutive = false;
          break;
        }
      }

      if (isConsecutive) return true;
    }

    return false;
  }

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const achievements = this.storage.getAchievements();

    // Build HTML string for better performance
    let html = '';
    for (const [key, def] of Object.entries(this.definitions)) {
      const unlocked = achievements[key] ? 'unlocked' : '';
      html += `<div class="achievement-item ${unlocked}"><div class="achievement-icon-large">${def.icon}</div><div class="achievement-label">${def.name}</div><div class="achievement-desc">${def.desc}</div></div>`;
    }

    container.innerHTML = html;
  }
}

// ============ APP CONTROLLER ============
class App {
  constructor() {
    this.storage = new StorageManager();
    this.sound = new SoundManager();
    this.confetti = new ConfettiManager('confetti-canvas');
    this.toast = new ToastManager('toast-container');
    this.cardShuffle = new CardShuffleManager('cardsContainer', this.storage);
    this.modal = new ModalManager();
    this.achievements = new AchievementManager(this.storage, this.confetti, this.sound, this.toast);

    // Track if modals need refresh
    this.modalNeedsRefresh = {
      list: false,
      history: false,
      achievements: false,
    };

    this.init();
  }

  init() {
    this.renderPlaceholderCards();
    this.updateUI();
    this.setupEventListeners();
    this.updateStreak();

    // Initial render for modals (mark all as needing refresh on first open)
    this.modalNeedsRefresh.list = true;
    this.modalNeedsRefresh.history = true;
    this.modalNeedsRefresh.achievements = true;
  }

  addSmartEventListener(element, callback) {
    if (!element) return;
    let touchStarted = false;
    const onPress = (e) => {
      if (e.cancelable) e.preventDefault();
      element.classList.add('button-active');
      touchStarted = e.type === 'touchstart';
    };
    const onRelease = (e) => {
      if (e.cancelable) e.preventDefault();
      element.classList.remove('button-active');
      if (!touchStarted || e.type === 'touchend') {
        callback(e);
      }
    };
    const onCancel = () => element.classList.remove('button-active');
    element.addEventListener('mousedown', onPress);
    element.addEventListener('touchstart', onPress, { passive: false });
    element.addEventListener('mouseup', onRelease);
    element.addEventListener('touchend', onRelease);
    element.addEventListener('mouseleave', onCancel);
  }

  setupEventListeners() {
    this.addSmartEventListener(document.getElementById('startBtn'), () => this.handleStart());

    this.addSmartEventListener(document.getElementById('shuffleBtn'), () => this.handleShuffle());

    this.addSmartEventListener(document.getElementById('addFoodBtn'), () => {
      this.sound.play('click');
      this.modal.open('add');
    });

    this.addSmartEventListener(document.getElementById('viewListBtn'), () => {
      this.sound.play('click');
      const searchInput = document.getElementById('searchFoodInput');
      if (searchInput) searchInput.value = '';

      // Refresh only if data changed since last open
      if (this.modalNeedsRefresh.list) {
        this.renderFoodList();
        this.modalNeedsRefresh.list = false;
      }
      this.modal.open('list');
    });

    this.addSmartEventListener(document.getElementById('historyBtn'), () => {
      this.sound.play('click');

      // Refresh only if data changed since last open
      if (this.modalNeedsRefresh.history) {
        this.renderHistory();
        this.modalNeedsRefresh.history = false;
      }
      this.modal.open('history');
    });

    this.addSmartEventListener(document.getElementById('achievementsBtn'), () => {
      this.sound.play('click');

      // Refresh only if data changed since last open
      if (this.modalNeedsRefresh.achievements) {
        this.achievements.render('achievementsGrid');
        this.modalNeedsRefresh.achievements = false;
      }
      this.modal.open('achievements');
    });

    // Settings button
    this.addSmartEventListener(document.getElementById('settingsBtn'), () => {
      this.sound.play('click');
      this.initSettingsUI();
      this.modal.open('settings');
    });

    this.addSmartEventListener(document.getElementById('logoBtn'), () => {
      this.sound.play('click');
      this.modal.open('about');
    });

    this.addSmartEventListener(document.getElementById('confirmAddBtn'), () => {
      this.handleAddFood();
    });

    this.bindSettingsUI();

    document.getElementById('newFoodInput')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleAddFood();
      }
    });

    const searchInput = document.getElementById('searchFoodInput');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.renderFoodList(e.target.value);
        }, 150);
      });
    }

    const searchHistoryInput = document.getElementById('searchHistoryInput');
    if (searchHistoryInput) {
      let historyTimeout;
      searchHistoryInput.addEventListener('input', (e) => {
        clearTimeout(historyTimeout);
        historyTimeout = setTimeout(() => {
          this.renderHistory(e.target.value);
        }, 150);
      });
    }

    this.addSmartEventListener(document.getElementById('clearHistoryBtn'), () => {
      if (confirm('Xóa toàn bộ lịch sử?')) {
        this.storage.setHistory([]);
        this.renderHistory();
        this.sound.play('delete');
        this.toast.show('Đã xóa toàn bộ lịch sử!', 'success');

        // Mark history for refresh
        this.modalNeedsRefresh.history = true;
      }
    });
  }

  initSettingsUI() {
    const settings = this.storage.getSettings();
    const autoFreezeToggle = document.getElementById('autoFreezeToggle');
    const mealReminderToggle = document.getElementById('mealReminderToggle');
    const mealOptions = document.getElementById('mealOptions');
    const remindBreakfast = document.getElementById('remindBreakfast');
    const remindLunch = document.getElementById('remindLunch');
    const remindDinner = document.getElementById('remindDinner');
    const enablePushBtn = document.getElementById('enablePushBtn');
    const pushStatus = document.getElementById('pushStatus');

    if (autoFreezeToggle) autoFreezeToggle.checked = !!settings.autoFreeze;
    if (mealReminderToggle) mealReminderToggle.checked = !!settings.reminders.enabled;
    if (remindBreakfast) remindBreakfast.checked = !!settings.reminders.breakfast;
    if (remindLunch) remindLunch.checked = !!settings.reminders.lunch;
    if (remindDinner) remindDinner.checked = !!settings.reminders.dinner;
    if (mealOptions) mealOptions.style.display = settings.reminders.enabled ? 'grid' : 'none';

    // Start countdown timer if in cooldown
    this.startPushCooldownTimer(enablePushBtn, pushStatus);
  }

  startPushCooldownTimer(enablePushBtn, pushStatus) {
    if (!enablePushBtn || !pushStatus) return;

    // Clear existing timer if any
    if (this._cooldownTimer) {
      clearInterval(this._cooldownTimer);
      this._cooldownTimer = null;
    }

    const COOLDOWN_DURATION = 30000; // 30 seconds
    const lastAttempt = Number(localStorage.getItem('push_subscribe_last') || '0');

    const updateCountdown = () => {
      const elapsed = Date.now() - lastAttempt;
      const remaining = COOLDOWN_DURATION - elapsed;

      if (remaining > 0) {
        const secondsLeft = Math.ceil(remaining / 1000);
        enablePushBtn.disabled = true;
        pushStatus.textContent = `⏱️ Đợi ${secondsLeft} giây để thử lại...`;
        pushStatus.style.color = '#FF9500';
      } else {
        // Cooldown finished
        enablePushBtn.disabled = false;
        pushStatus.textContent = '';
        pushStatus.style.color = '';
        if (this._cooldownTimer) {
          clearInterval(this._cooldownTimer);
          this._cooldownTimer = null;
        }
      }
    };

    // Update immediately
    updateCountdown();

    // If still in cooldown, start interval timer
    const elapsed = Date.now() - lastAttempt;
    if (elapsed < COOLDOWN_DURATION) {
      this._cooldownTimer = setInterval(updateCountdown, 1000);
    }
  }

  bindSettingsUI() {
    const autoFreezeToggle = document.getElementById('autoFreezeToggle');
    const mealReminderToggle = document.getElementById('mealReminderToggle');
    const mealOptions = document.getElementById('mealOptions');
    const remindBreakfast = document.getElementById('remindBreakfast');
    const remindLunch = document.getElementById('remindLunch');
    const remindDinner = document.getElementById('remindDinner');
    const enablePushBtn = document.getElementById('enablePushBtn');
    const pushStatus = document.getElementById('pushStatus');

    if (autoFreezeToggle) {
      autoFreezeToggle.addEventListener('change', () => {
        this.storage.updateSettings({ autoFreeze: autoFreezeToggle.checked });
        this.toast.show(
          autoFreezeToggle.checked
            ? 'Đã bật tự động đóng băng chuỗi'
            : 'Đã tắt tự động đóng băng chuỗi',
          'success',
        );
      });
    }

    const updateReminder = () => {
      const current = this.storage.getSettings();
      const updates = {
        reminders: {
          ...current.reminders,
          enabled: mealReminderToggle.checked,
          breakfast: remindBreakfast.checked,
          lunch: remindLunch.checked,
          dinner: remindDinner.checked,
        },
      };
      this.storage.updateSettings(updates);
      if (mealOptions) mealOptions.style.display = mealReminderToggle.checked ? 'grid' : 'none';
    };

    if (mealReminderToggle) mealReminderToggle.addEventListener('change', updateReminder);
    if (remindBreakfast) remindBreakfast.addEventListener('change', updateReminder);
    if (remindLunch) remindLunch.addEventListener('change', updateReminder);
    if (remindDinner) remindDinner.addEventListener('change', updateReminder);

    if (enablePushBtn) {
      enablePushBtn.addEventListener('click', async () => {
        enablePushBtn.disabled = true;
        try {
          if (!('Notification' in window)) {
            if (pushStatus) pushStatus.textContent = 'Trình duyệt không hỗ trợ thông báo.';
            this.toast.show('Trình duyệt không hỗ trợ thông báo', 'error');
            return;
          }

          if (!('serviceWorker' in navigator)) {
            if (pushStatus) pushStatus.textContent = 'Service Worker không được hỗ trợ.';
            this.toast.show('Service Worker không được hỗ trợ', 'error');
            return;
          }

          const perm = await Notification.requestPermission();
          if (perm !== 'granted') {
            if (pushStatus) pushStatus.textContent = 'Bạn đã từ chối quyền thông báo.';
            this.toast.show('Cần cấp quyền thông báo', 'error');
            return;
          }

          if (pushStatus) pushStatus.textContent = 'Đang đăng ký...';

          const subscribed = await this.subscribePush();
          if (subscribed) {
            if (pushStatus) pushStatus.textContent = '✅ Đã bật thông báo thành công!';
            this.toast.show('Đã bật thông báo nhắc bữa ăn', 'success');

            // Start cooldown timer after successful subscription
            this.startPushCooldownTimer(enablePushBtn, pushStatus);
          } else {
            if (pushStatus) pushStatus.textContent = '❌ Không thể đăng ký thông báo.';
            this.toast.show('Không thể đăng ký thông báo', 'error');
            enablePushBtn.disabled = false;
          }
        } catch (e) {
          console.error('Push subscription error:', e);
          const errorMsg = e.message || e.name || 'Lỗi không xác định';
          if (pushStatus) {
            pushStatus.textContent = `❌ Lỗi: ${errorMsg}`;
            pushStatus.style.color = '#FF4B4B';
          }
          this.toast.show(`Không thể bật thông báo: ${errorMsg}`, 'warning');

          // If cooldown error, start timer; otherwise re-enable button
          if (errorMsg.includes('giây')) {
            this.startPushCooldownTimer(enablePushBtn, pushStatus);
          } else {
            enablePushBtn.disabled = false;
          }
        }
      });
    }
  }

  async subscribePush() {
    // Prevent concurrent calls and rapid re-tries
    if (this._subscribing) {
      throw new Error('Đang đăng ký, vui lòng chờ...');
    }
    const lastTs = Number(localStorage.getItem('push_subscribe_last') || '0');
    const timeSinceLastAttempt = Date.now() - lastTs;
    if (timeSinceLastAttempt < 30000) {
      const secondsLeft = Math.ceil((30000 - timeSinceLastAttempt) / 1000);
      throw new Error(`Vui lòng đợi ${secondsLeft} giây nữa để thử lại`);
    }

    this._subscribing = true;
    try {
      if (!('serviceWorker' in navigator)) {
        throw new Error('Trình duyệt không hỗ trợ Service Worker');
      }

      if (!('PushManager' in window)) {
        throw new Error('Trình duyệt không hỗ trợ Push Notifications');
      }

      // Check permission
      let permission = Notification.permission;
      if (permission === 'denied') {
        throw new Error('Bạn đã chặn thông báo. Vui lòng bật lại trong cài đặt trình duyệt');
      }

      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      if (permission !== 'granted') {
        throw new Error('Cần cấp quyền thông báo để tiếp tục');
      }

      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        throw new Error('VAPID key không được cấu hình');
      }

      const registration = await navigator.serviceWorker.ready;

      // Reuse existing subscription if available to avoid churn
      let subscription = await registration.pushManager.getSubscription();

      // Convert VAPID key
      const applicationServerKey = this.urlBase64ToUint8Array(vapidKey);
      if (applicationServerKey.length !== 65) {
        throw new Error('VAPID key có độ dài không hợp lệ');
      }

      // Create subscription only if not exists
      if (!subscription) {
        const subscribePromise = registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Đăng ký timeout sau 30 giây')), 30000),
        );
        subscription = await Promise.race([subscribePromise, timeoutPromise]);
      }

      // Send to server
      const settings = this.storage.getSettings();
      const response = await fetch('/.netlify/functions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          preferences: settings.reminders,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));

        // If rate limited, update timestamp and throw error
        if (response.status === 429) {
          localStorage.setItem('push_subscribe_last', String(Date.now()));
          throw new Error('Bạn đang thao tác quá nhanh. Vui lòng đợi giây lát.');
        }

        throw new Error(`Server error: ${errorData.error || response.statusText}`);
      }

      // Mark last success time for cooldown
      localStorage.setItem('push_subscribe_last', String(Date.now()));
      return true;
    } catch (error) {
      console.error('Push subscription error:', error);
      throw error;
    } finally {
      this._subscribing = false;
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  handleStart() {
    const foods = this.storage.getFoods();

    if (foods.length === 0) {
      this.toast.show('Hãy thêm món ăn trước!', 'warning');
      this.modal.open('add');
      return;
    }

    this.sound.play('shuffle');

    // Hide start button, show shuffle button
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('shuffleBtn').style.display = 'flex';

    // Shuffle cards with animation
    this.cardShuffle.shuffle(() => {
      // Cards are now face down and ready to flip
    });
  }

  handleShuffle() {
    const foods = this.storage.getFoods();

    if (foods.length === 0) {
      this.toast.show('Hãy thêm món ăn trước!', 'warning');
      this.modal.open('add');
      return;
    }

    this.sound.play('shuffle');
    const shuffleBtn = document.getElementById('shuffleBtn');
    shuffleBtn.classList.add('shuffling');

    this.cardShuffle.shuffle(() => {
      shuffleBtn.classList.remove('shuffling');
    });
  }

  handleCardSelect(food) {
    // Play success sound
    this.sound.play('select');
    this.confetti.launch();

    // Update streak first
    this.updateStreak();

    // Calculate smart points based on multiple factors
    const stats = this.storage.getStats();
    const history = this.storage.getHistory();
    const streak = stats.currentStreak || 0;

    let earnedPoints = 5; // Base points
    let bonusMessage = '';

    // Streak bonus: +1 point per 5 days of streak (max +10)
    if (streak >= 5) {
      const streakBonus = Math.min(Math.floor(streak / 5), 10);
      earnedPoints += streakBonus;
      if (streakBonus > 0) bonusMessage += ` +${streakBonus} streak`;
    }

    // New food bonus: +3 points if trying something not in recent 10 selections
    const recent10 = history.slice(0, 10).map((h) => h.food);
    if (!recent10.includes(food)) {
      earnedPoints += 3;
      bonusMessage += ' +3 mới';
    }

    // Category diversity bonus: +2 if different category from last pick
    if (history.length > 0) {
      const lastFood = history[0].food;
      const lastCategory = this.cardShuffle.getFoodCategory(lastFood);
      const currentCategory = this.cardShuffle.getFoodCategory(food);
      if (lastCategory !== currentCategory && currentCategory !== 'other') {
        earnedPoints += 2;
        bonusMessage += ' +2 đa dạng';
      }
    }

    this.storage.updateStats({
      totalSuggestions: stats.totalSuggestions + 1,
      points: stats.points + earnedPoints,
    });

    this.achievements.check(this.storage.getStats());

    this.updateUI();

    // Mark modals for refresh
    this.modalNeedsRefresh.history = true;
    this.modalNeedsRefresh.list = true;
    this.modalNeedsRefresh.achievements = true;

    const message = bonusMessage
      ? `🎉 Hôm nay ăn ${food}! (+${earnedPoints} điểm:${bonusMessage})`
      : `🎉 Hôm nay ăn ${food}! (+${earnedPoints} điểm)`;
    this.toast.show(message, 'success');
  }

  handleAddFood() {
    const input = document.getElementById('newFoodInput');
    const food = input.value.trim();

    if (!food) {
      this.toast.show('Vui lòng nhập tên món ăn!', 'warning');
      return;
    }

    if (this.storage.addFood(food)) {
      this.sound.play('add');

      const stats = this.storage.getStats();
      const foods = this.storage.getFoods();
      let earnedPoints = 3;
      let bonusMessage = '';

      const milestones = [100, 50, 25, 10];
      for (const milestone of milestones) {
        if (foods.length === milestone) {
          const milestoneBonus = milestone >= 50 ? 20 : milestone >= 25 ? 10 : 5;
          earnedPoints += milestoneBonus;
          bonusMessage = ` 🎊 ${milestone} món! +${milestoneBonus} bonus`;
          break;
        }
      }

      const recentAdds = this.storage
        .getHistory()
        .filter((h) => h.source === 'manual')
        .slice(0, 5);
      if (recentAdds.length >= 3) {
        earnedPoints += 1;
        if (!bonusMessage) bonusMessage = ' +1 nhiệt tình';
      }

      this.storage.updateStats({ points: stats.points + earnedPoints });

      const message = `Đã thêm ${food}! (+${earnedPoints} điểm${bonusMessage})`;
      this.toast.show(message, 'success');

      this.cardShuffle.render(null, true);
      this.updateUI();

      // Mark modals for refresh
      this.modalNeedsRefresh.list = true;
      this.modalNeedsRefresh.achievements = true;

      this.achievements.check(this.storage.getStats());

      input.value = '';
      input.focus();
    } else {
      this.toast.show('Món này đã có rồi!', 'error');
    }
  }

  renderFoodList(searchTerm = '') {
    const container = document.getElementById('foodChips');
    const countElement = document.getElementById('foodCount');
    const foods = this.storage.getFoods();

    container.innerHTML = '';

    if (foods.length === 0) {
      container.classList.add('empty');
      if (countElement) countElement.textContent = '(0)';
      return;
    }

    container.classList.remove('empty');

    const filteredFoods = searchTerm
      ? foods.filter((food) => food.toLowerCase().includes(searchTerm.toLowerCase()))
      : foods;

    if (countElement) {
      countElement.textContent = searchTerm
        ? `(${filteredFoods.length}/${foods.length})`
        : `(${foods.length})`;
    }

    if (filteredFoods.length === 0) {
      container.innerHTML =
        '<p style="text-align: center; color: #999; padding: 40px;">Không tìm thấy món ăn nào 😕</p>';
      return;
    }

    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();

    filteredFoods.forEach((food) => {
      const chip = document.createElement('div');
      chip.className = 'food-chip';
      chip.innerHTML = `
        <span>${food}</span>
        <button class="chip-delete" data-food="${food}">✕</button>
      `;

      const deleteBtn = chip.querySelector('.chip-delete');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleDeleteFood(food);
      });

      fragment.appendChild(chip);
    });

    container.appendChild(fragment);
  }

  handleDeleteFood(food) {
    if (confirm(`Xóa "${food}"?`)) {
      this.storage.deleteFood(food);
      this.sound.play('delete');
      this.toast.show(`Đã xóa ${food}!`, 'success');
      this.renderFoodList();
      this.cardShuffle.render(null, true);
      this.updateUI();

      // Mark list for refresh
      this.modalNeedsRefresh.list = true;
    }
  }

  renderHistory(searchTerm = '') {
    const container = document.getElementById('historyCards');
    let history = this.storage.getHistory();

    this.renderHistoryStats(history);

    if (searchTerm) {
      history = history.filter((item) =>
        item.food.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    container.innerHTML = '';

    if (history.length === 0) {
      const message = searchTerm
        ? `Không tìm thấy "${searchTerm}" trong lịch sử 😕`
        : 'Chưa có lịch sử nào';
      container.innerHTML = `<p style="text-align: center; color: #999; padding: 20px;">${message}</p>`;
      return;
    }

    const groupedHistory = this.groupHistoryByDate(history);

    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();

    // Render each date group
    groupedHistory.forEach((group) => {
      // Date header
      const dateHeader = document.createElement('div');
      dateHeader.className = 'history-date-header';
      dateHeader.textContent = group.label;
      fragment.appendChild(dateHeader);

      group.items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'history-card';

        const emoji = this.cardShuffle.getEmoji(item.food);
        const time = new Date(item.timestamp).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Ho_Chi_Minh',
        });

        card.innerHTML = `
          <div class="history-card-left">
            <span class="history-emoji">${emoji}</span>
            <span class="history-food">${item.food}</span>
          </div>
          <div class="history-card-right">
            <span class="history-time">${time}</span>
            <button class="history-action-btn redo-btn" data-food="${
              item.food
            }" title="Ăn lại">🔄</button>
            <button class="history-action-btn delete-btn" data-id="${
              item.id || item.timestamp
            }" title="Xóa">✕</button>
          </div>
        `;

        const redoBtn = card.querySelector('.redo-btn');
        redoBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.handleRedoFood(item.food);
        });

        const deleteBtn = card.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.handleDeleteHistoryItem(item.id || item.timestamp);
        });

        fragment.appendChild(card);
      });
    });

    container.appendChild(fragment);
  }

  handleRedoFood(food) {
    this.sound.play('select');
    this.storage.addHistory(food);

    this.updateStreak();

    const stats = this.storage.getStats();
    const history = this.storage.getHistory();
    const streak = stats.currentStreak || 0;

    let earnedPoints = 4;
    let bonusMessage = '';

    if (streak >= 5) {
      const streakBonus = Math.min(Math.floor(streak / 5), 10);
      earnedPoints += streakBonus;
      if (streakBonus > 0) bonusMessage += ` +${streakBonus} streak`;
    }

    const selectedHistory = history.find((h) => h.food === food);
    if (selectedHistory) {
      const daysSinceSelected = Math.floor(
        (Date.now() - selectedHistory.timestamp) / (1000 * 60 * 60 * 24),
      );
      if (daysSinceSelected >= 30) {
        earnedPoints += 2;
        bonusMessage += ' +2 hoài niệm';
      }
    }

    this.storage.updateStats({
      totalSuggestions: stats.totalSuggestions + 1,
      points: stats.points + earnedPoints,
    });

    this.achievements.check(this.storage.getStats());
    this.updateUI();
    this.renderHistory();

    // Mark modals for refresh
    this.modalNeedsRefresh.history = true;
    this.modalNeedsRefresh.achievements = true;

    const message = bonusMessage
      ? `Đã chọn lại: ${food}! (+${earnedPoints} điểm:${bonusMessage})`
      : `Đã chọn lại: ${food}! (+${earnedPoints} điểm)`;
    this.toast.show(message, 'success');
  }

  handleDeleteHistoryItem(idOrTimestamp) {
    const history = this.storage.getHistory();
    const filtered = history.filter((item) => (item.id || item.timestamp) !== idOrTimestamp);
    this.storage.setHistory(filtered);
    this.sound.play('delete');
    this.renderHistory();
    this.toast.show('Đã xóa!', 'success');

    // Mark history for refresh
    this.modalNeedsRefresh.history = true;
  }

  groupHistoryByDate(history) {
    const groups = [];
    const today = TimeHelper.getVietnamDateOnly();

    const dateMap = new Map();

    history.forEach((item) => {
      const itemDate = new Date(item.timestamp);
      itemDate.setHours(0, 0, 0, 0);
      const dateKey = itemDate.toDateString();

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          date: itemDate,
          items: [],
        });
      }
      dateMap.get(dateKey).items.push(item);
    });

    const sortedGroups = Array.from(dateMap.values()).sort((a, b) => b.date - a.date);

    sortedGroups.forEach((group) => {
      const daysDiff = Math.floor((today - group.date) / (1000 * 60 * 60 * 24));
      let label;

      if (daysDiff === 0) {
        label = '📅 Hôm nay';
      } else if (daysDiff === 1) {
        label = '📅 Hôm qua';
      } else if (daysDiff === 2) {
        label = '📅 Hôm kia';
      } else if (daysDiff <= 7) {
        label = `📅 ${daysDiff} ngày trước`;
      } else {
        label = `📅 ${group.date.toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          timeZone: 'Asia/Ho_Chi_Minh',
        })}`;
      }

      groups.push({
        label,
        date: group.date,
        items: group.items,
      });
    });

    return groups;
  }

  renderHistoryStats(history) {
    const statsContainer = document.getElementById('historyStats');
    if (!statsContainer) return;

    const totalSuggestions = history.length;
    const uniqueFoods = new Set(history.map((h) => h.food)).size;

    const foodCount = {};
    history.forEach((item) => {
      foodCount[item.food] = (foodCount[item.food] || 0) + 1;
    });

    const sortedFoods = Object.entries(foodCount).sort((a, b) => b[1] - a[1]);
    const favoriteFood = sortedFoods.length > 0 ? sortedFoods[0][0] : 'Chưa có';
    const favoriteFoodDisplay =
      favoriteFood.length > 12 ? favoriteFood.substring(0, 12) + '...' : favoriteFood;

    statsContainer.innerHTML = `
      <div class="stat-box">
        <span class="stat-box-value">${totalSuggestions}</span>
        <span class="stat-box-label">Lần Chọn</span>
      </div>
      <div class="stat-box">
        <span class="stat-box-value">${uniqueFoods}</span>
        <span class="stat-box-label">Món Khác Nhau</span>
      </div>
      <div class="stat-box favorite">
        <span class="stat-box-value">${favoriteFoodDisplay}</span>
        <span class="stat-box-label">Món Yêu Thích</span>
      </div>
    `;
  }

  updateUI() {
    const stats = this.storage.getStats();
    const foods = this.storage.getFoods();

    document.getElementById('streak').textContent = stats.streak;
    document.getElementById('points').textContent = stats.points;

    const hasCards = this.cardShuffle.currentCards.length > 0;
    const startBtn = document.getElementById('startBtn');
    const shuffleBtn = document.getElementById('shuffleBtn');

    if (!hasCards && foods.length > 0) {
      startBtn.style.display = 'flex';
      shuffleBtn.style.display = 'none';
    } else if (hasCards) {
      startBtn.style.display = 'none';
      shuffleBtn.style.display = 'flex';
    } else {
      startBtn.style.display = 'none';
      shuffleBtn.style.display = 'none';
    }
  }

  updateStreak() {
    const stats = this.storage.getStats();

    const now = new Date();
    const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    const today = new Date(
      vietnamTime.getFullYear(),
      vietnamTime.getMonth(),
      vietnamTime.getDate(),
    );

    const lastDate = stats.lastSuggestionDate ? new Date(stats.lastSuggestionDate) : null;
    const lastDateOnly = lastDate
      ? new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate())
      : null;

    if (lastDateOnly && lastDateOnly.getTime() === today.getTime()) {
      return;
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dayMs = 24 * 60 * 60 * 1000;
    const gapDays = lastDateOnly ? Math.round((today - lastDateOnly) / dayMs) : null;
    const freezeCost = 50; // Assumption: 50 points to freeze one missed day
    const settings = this.storage.getSettings ? this.storage.getSettings() : { autoFreeze: true };

    if (!lastDateOnly) {
      this.storage.updateStats({
        streak: 1,
        lastSuggestionDate: today.toISOString(),
      });
    } else if (lastDateOnly.getTime() === yesterday.getTime()) {
      this.storage.updateStats({
        streak: stats.streak + 1,
        lastSuggestionDate: today.toISOString(),
      });
    } else if (lastDateOnly < yesterday) {
      const missedDays = gapDays - 1;

      if (settings.autoFreeze && gapDays === 2 && stats.points >= freezeCost) {
        this.storage.updateStats({
          streak: stats.streak + 1,
          lastSuggestionDate: today.toISOString(),
          points: stats.points - freezeCost,
        });
        this.toast.show(`Đã dùng ${freezeCost} điểm để đóng băng chuỗi!`, 'success');
      } else {
        this.storage.updateStats({
          streak: 1,
          lastSuggestionDate: today.toISOString(),
        });

        if (missedDays === 1 && stats.points < freezeCost) {
          this.toast.show(
            `💔 Streak đã reset! Bạn thiếu ${freezeCost - stats.points} điểm để đóng băng.`,
            'error',
          );
        } else if (missedDays === 1 && !settings.autoFreeze) {
          this.toast.show(
            `💔 Streak đã reset! Bật "Auto Freeze" trong cài đặt để tự động đóng băng.`,
            'error',
          );
        } else if (missedDays > 1) {
          this.toast.show(`Bạn đã nghỉ ${missedDays} ngày. Streak đã reset về 1.`, 'error');
        } else {
          this.toast.show(`Streak đã reset về 1!`, 'error');
        }
      }
    }

    this.updateUI();
    this.achievements.check(this.storage.getStats());
  }

  renderPlaceholderCards() {
    const container = document.getElementById('cardsContainer');
    container.innerHTML = '';

    for (let i = 0; i < 6; i++) {
      const card = document.createElement('div');
      card.className = 'food-card face-down placeholder';
      card.style.animationDelay = `${i * 0.05}s`;
      container.appendChild(card);
    }
  }
}

// ============ INITIALIZE APP ============
document.addEventListener('DOMContentLoaded', () => {
  // Preloader tips rotation
  const tips = [
    '💡 Thêm nhiều món để có gợi ý đa dạng hơn!',
    '🔥 Duy trì streak mỗi ngày để nhận bonus điểm!',
    '🎯 Gợi ý thông minh theo giờ ăn và sở thích',
    '⭐ +3 điểm khi thử món mới trong 10 lần gần nhất',
    '🌈 +2 điểm khi chọn món khác loại lần trước',
    '🏆 Mở khóa 15 thành tích từ dễ đến khó!',
    '❄️ Auto-freeze giữ streak khi nghỉ 1 ngày (50 điểm)',
    '📜 "Ăn lại" từ lịch sử cũng được tính điểm!',
    '🎊 Milestone bonus: 10, 25, 50, 100 món ăn!',
    '💾 Ứng dụng hoạt động 100% offline không cần mạng',
    '🃏 Xáo bài để khám phá những gợi ý mới!',
    '🔔 Thông báo nhắc bữa ăn 3 lần/ngày (cần bật)',
  ];

  const tipElement = document.getElementById('preloaderTip');
  let currentTipIndex = 0;

  const tipInterval = setInterval(() => {
    currentTipIndex = (currentTipIndex + 1) % tips.length;
    if (tipElement) {
      tipElement.style.animation = 'none';
      setTimeout(() => {
        tipElement.textContent = tips[currentTipIndex];
        tipElement.style.animation = 'fadeIn 0.5s ease';
      }, 50);
    }
  }, 2000);

  const preloader = document.getElementById('preloader');

  // Initialize app early to pre-render modals
  const app = new App();
  window.app = app;

  // Pre-render all modal contents during preloader
  setTimeout(() => {
    app.renderFoodList();
    app.renderHistory();
    app.achievements.render('achievementsGrid');
  }, 100);

  setTimeout(() => {
    clearInterval(tipInterval);
    preloader.classList.add('hidden');
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 500);
  }, 2500);

  const subtitleTips = [
    'Chọn một lá bài! 🃏',
    'Hôm nay ăn gì nhỉ? 🤔',
    'Lật thẻ để khám phá món ngon! ✨',
    'Gợi ý thông minh theo giờ ăn 🕐',
    'Thử món mới để nhận bonus! 🎁',
    'Streak của bạn đang chờ đấy! 🔥',
    'Mỗi món là một cuộc phiêu lưu! 🗺️',
    'Chọn đa dạng để được +2 điểm! 🌈',
    'Xáo bài nào! 🎲',
    'Thu thập điểm, mở khóa thành tích! 🏆',
    'Để app quyết định hộ bạn! 🎯',
    'Món nào ngon đây? 🍜',
  ];

  const subtitleElement = document.getElementById('subtitleTip');
  let currentSubtitleIndex = 0;

  setTimeout(() => {
    setInterval(() => {
      currentSubtitleIndex = (currentSubtitleIndex + 1) % subtitleTips.length;
      if (subtitleElement) {
        subtitleElement.style.animation = 'none';
        setTimeout(() => {
          subtitleElement.textContent = subtitleTips[currentSubtitleIndex];
          subtitleElement.style.animation = 'fadeIn 0.5s ease';
        }, 50);
      }
    }, 3000);
  }, 3000);
});
