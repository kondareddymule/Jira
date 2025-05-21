import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'date'
})
export class DatePipe implements PipeTransform {

  transform(value: any){
    let date = new Date(value)
    let day = date.getDate()
    let month = date.getMonth()
    let year = date.getFullYear()
    let hour = date.getHours()
    let minute = date.getMinutes()
    let AMPM = ""
    let hours = 0
    if (hour === 0) {
      hours = 12;
      AMPM = "AM";
    } else if (hour > 12) {
      hours = hour - 12;
      AMPM = "PM";
    } else {
      hours = hour;
      AMPM = "AM";
    }

    return `${String(day).padStart(2,"0")}/${String((month + 1)).padStart(2,"0")}/${year},${hours}:${String(minute).padStart(2, "0")} ${AMPM}`
  }
}
