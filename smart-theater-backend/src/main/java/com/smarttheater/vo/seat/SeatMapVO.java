package com.smarttheater.vo.seat;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class SeatMapVO {
    private Long seatMapId;
    private String seatMapName;
    private Integer totalRows;
    private List<SeatRow> rows;
    private List<SeatPriceInfo> prices;

    @Data
    public static class SeatRow {
        private Integer rowNum;
        private List<SeatInfo> seats;
    }

    @Data
    public static class SeatInfo {
        private Long seatId;
        private Integer rowNum;
        private Integer colNum;
        private String seatLabel;
        private String seatType;
        private String status; // AVAILABLE, LOCKED, SOLD, UNAVAILABLE
        private BigDecimal price;
    }

    @Data
    public static class SeatPriceInfo {
        private String seatType;
        private BigDecimal price;
    }
}
