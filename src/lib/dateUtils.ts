export interface SpecialDateInfo {
  isSonDay: boolean; // 손없는 날 (음력 끝자리 9, 0)
  isFriday: boolean; // 금요일 (주말 시작)
  isEndOfMonth: boolean; // 월말 (25일 이후)
  lunarDateStr?: string; // 음력 표기
}

/**
 * 날짜 문자열(YYYY-MM-DD)을 기반으로 손없는 날, 금요일, 월말 여부를 판별합니다.
 */
export function checkSpecialDate(dateStr?: string): SpecialDateInfo {
  if (!dateStr) return { isSonDay: false, isFriday: false, isEndOfMonth: false };

  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    return { isSonDay: false, isFriday: false, isEndOfMonth: false };
  }

  const [year, month, day] = parts;
  const dateObj = new Date(year, month - 1, day);
  if (isNaN(dateObj.getTime())) {
    return { isSonDay: false, isFriday: false, isEndOfMonth: false };
  }

  // 1. 금요일 (getDay() === 5)
  const isFriday = dateObj.getDay() === 5;

  // 2. 월말 (25일 이상)
  const isEndOfMonth = day >= 25;

  // 3. 손없는 날 (음력 끝자리가 9 또는 0인 날)
  let isSonDay = false;
  let lunarDateStr = '';
  try {
    const f = new Intl.DateTimeFormat('ko-KR-u-ca-chinese', { month: 'numeric', day: 'numeric' });
    const formattedParts = f.formatToParts(dateObj);
    const dayPart = formattedParts.find(p => p.type === 'day');
    const monthPart = formattedParts.find(p => p.type === 'month');
    
    if (dayPart) {
      const lunarDay = parseInt(dayPart.value, 10);
      if (lunarDay % 10 === 9 || lunarDay % 10 === 0) {
        isSonDay = true;
      }
      if (monthPart) {
        lunarDateStr = `음력 ${monthPart.value}.${lunarDay}`;
      }
    }
  } catch (e) {
    // Intl 지원되지 않는 환경 폴백
  }

  return { isSonDay, isFriday, isEndOfMonth, lunarDateStr };
}
