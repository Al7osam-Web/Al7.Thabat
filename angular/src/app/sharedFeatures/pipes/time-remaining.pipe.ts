import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeRemaining',
  pure: false // هذا يضمن تحديث الزمن المتبقي بشكل تلقائي
})
export class TimeRemainingPipe implements PipeTransform {
  

  transform(startDate: string | Date): string {
    const now = new Date();
    const targetDate = new Date(startDate);
    const diffMs = targetDate.getTime() - now.getTime(); // الفرق بالملي ثانية

    const isPast = diffMs < 0; // هل الموعد قد فات؟
    const absDiff = Math.abs(diffMs); // القيمة المطلقة للفرق

    // تحويل الفرق إلى أيام وساعات ودقائق وثوانٍ
    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); 
    const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);

    if (isPast) {
        return ` - ${days}:${hours}:${minutes}:${seconds} `;
    } else {
        return ` ${days}:${hours}:${minutes}:${seconds} `;
    }
  }
}
