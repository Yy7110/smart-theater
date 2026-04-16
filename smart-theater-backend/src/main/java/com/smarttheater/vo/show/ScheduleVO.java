package com.smarttheater.vo.show;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class ScheduleVO {
    private Long id;
    private Long showId;
    private LocalDate showDate;
    private LocalTime showTime;
    private LocalTime endTime;
    private String status;
    private Integer totalTickets;
    private Integer soldTickets;
    private Integer availableTickets;
    private List<SeatPriceVO> prices;

    @Data
    public static class SeatPriceVO {
        private Long id;
        private String seatType;
        private BigDecimal price;
        private Integer available;
    }
}
