import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MONTHS } from '../../lib/utils.js';
import './MonthPicker.css';

export default function MonthPicker({ month, year, onChange }) {
    const handlePrev = () => {
        if (month === 1) {
            onChange(12, year - 1);
        } else {
            onChange(month - 1, year);
        }
    };

    const handleNext = () => {
        if (month === 12) {
            onChange(1, year + 1);
        } else {
            onChange(month + 1, year);
        }
    };

    return (
        <div className="month-picker">
            <button className="month-picker__btn" onClick={handlePrev}>
                <ChevronLeft size={18} />
            </button>
            <span className="month-picker__label">
                {MONTHS[month - 1]} {year}
            </span>
            <button className="month-picker__btn" onClick={handleNext}>
                <ChevronRight size={18} />
            </button>
        </div>
    );
}
