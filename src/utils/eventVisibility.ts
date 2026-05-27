export interface EventVisibility {
  showHead: boolean
  showStatus: boolean
  truncateStatus: boolean
  showPhone: boolean
  truncatePhone: boolean
  showTime: boolean
}

export function getEventVisibility(
  height: number,
  kind: 'order' | 'reservation',
): EventVisibility {
  if (kind === 'order') {
    return {
      showHead: height >= 20,
      showStatus: height >= 34,
      truncateStatus: height < 50,
      showPhone: false,
      truncatePhone: false,
      showTime: height >= 50,
    }
  }

  return {
    showHead: height >= 20,
    showStatus: height >= 30,
    truncateStatus: height < 46,
    showPhone: height >= 46,
    truncatePhone: height >= 46 && height < 62,
    showTime: height >= 62,
  }
}
