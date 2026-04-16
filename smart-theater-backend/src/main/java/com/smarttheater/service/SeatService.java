package com.smarttheater.service;

import com.smarttheater.vo.seat.SeatMapVO;
import java.util.List;

public interface SeatService {
    SeatMapVO getSeatMap(Long scheduleId);
    boolean lockSeats(Long scheduleId, List<Long> seatIds, Long userId);
    boolean unlockSeats(Long scheduleId, List<Long> seatIds, Long userId);
}
