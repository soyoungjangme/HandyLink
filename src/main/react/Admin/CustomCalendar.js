import React, { useState } from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import './CustomCalendar.css';

function CustomCalendar({ selectedDates, onDateSelect, reservations }) {
    const [dateRange, setDateRange] = useState({
        startDate: null,
        endDate: null,
        key: 'selection',
    });

    const [showReservations, setShowReservations] = useState(false); // 예약 리스트 표시 여부
    const [reservationsForSelectedDate, setReservationsForSelectedDate] = useState([]); // 선택된 날짜의 예약 정보

    const handleSelect = (ranges) => {
        const { selection } = ranges;

        if (selection.startDate && selection.endDate) {
            const selectedDateStrings = [];
            const start = selection.startDate;
            const end = selection.endDate;

            let currentDate = new Date(start);
            while (currentDate <= end) {
                selectedDateStrings.push(currentDate.toLocaleDateString());
                currentDate.setDate(currentDate.getDate() + 1);
            }

            onDateSelect(selectedDateStrings);
        } else {
            onDateSelect([]);
        }

        setDateRange(selection);
    };

    const getReservationsForDate = (date) => {
        const dateString = date.toLocaleDateString();
        return reservations.filter(reservation => {
            const reservationDate = new Date(reservation.regTime);
            return reservationDate.toLocaleDateString() === dateString;
        });
    };

    const handleDateClick = (date) => {
        const reservationsForDate = getReservationsForDate(date);
        setReservationsForSelectedDate(reservationsForDate);
        setShowReservations(true);
    };

    return (
        <div className="custom-calendar">
            <DateRange
                editableDateInputs={true}
                onChange={handleSelect}
                moveRangeOnFirstSelection={false}
                ranges={[dateRange]}
                months={1}
                direction="horizontal"
            />

            {/* 날짜 클릭 이벤트 핸들러 추가 */}
            {dateRange.startDate && dateRange.endDate && (
                <div className="reservations-display">
                    <h4>예약 정보</h4>
                    {selectedDates.map((date, index) => {
                        const currentDate = new Date(date);
                        return (
                            <div key={index}>
                                <strong 
                                    onClick={() => handleDateClick(currentDate)} // 날짜 클릭 시 예약 정보 표시
                                    style={{ cursor: 'pointer', color: 'blue' }}
                                >
                                    {date}
                                </strong>
                                {showReservations && reservationsForSelectedDate.length > 0 && (
                                    <ul>
                                        {reservationsForSelectedDate.map((reservation, i) => (
                                            <li key={i}>
                                                {reservation.userId} - {reservation.reservationStatus}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {showReservations && reservationsForSelectedDate.length === 0 && (
                                    <p>예약 없음</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default CustomCalendar;
