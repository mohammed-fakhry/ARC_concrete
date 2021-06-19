import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateInDays',
})
export class DateInDaysPipe implements PipeTransform {
  transform(value: string): { messege: string; class: string } {
    if (value == 'لا يوجد') return { messege: value, class: 'badge lightBlueBadge' };

    const handleDate = (number: number): string =>
      number > 9 ? `${number}` : `0${number}`;

    let Newtoday = new Date();
    let pastNewDate = new Date(value);

    const today = new Date(
      `${Newtoday.getFullYear()}-${handleDate(
        Newtoday.getMonth() + 1
      )}-${handleDate(Newtoday.getDate())}T00:00`
    );
    const past = new Date(
      `${pastNewDate.getFullYear()}-${handleDate(
        pastNewDate.getMonth() + 1
      )}-${handleDate(pastNewDate.getDate())}T00:00`
    );

    // remember this is equivalent to 06 01 2010
    //dates in js are counted from 0, so 05 is june

    if (
      `${today.getDate()}${today.getMonth()}${today.getFullYear()}` ===
      `${past.getDate()}${past.getMonth()}${past.getFullYear()}`
    )
      return { messege: 'اليوم', class: 'badge greenBadge' };

    const calcDate = (date1: Date, date2: Date) => {
      const diff = Math.floor(date1.getTime() - date2.getTime());
      const day = 1000 * 60 * 60 * 24;

      const days = Math.floor(diff / day);
      const months = Math.floor(days / 31);
      const years = Math.floor(months / 12);

      /* // if yester day */
      if (days == 1 && months == 0 && years == 0)
        return { messege: 'امس', class: 'badge greenBadge' };

      if (days == -1 && months == -1 && years == -1)
        return {
          messege: 'غدا',
          class: 'badge greenBadge borderRight-success',
        };

      /* // less then month */
      // befor
      if (days > 1 && days < 4 && months == -1 && years == -1)
        return {
          messege: `منذ ${days} يوم`,
          class: 'badge greenBadge',
        };
      // after
      if (days < -1 && days > -4 && months == -1 && years == -1)
        return {
          messege: `بعد ${days} يوم`,
          class: 'badge greenBadge borderRight-success',
        };

      // befor
      if (days > 1 && days < 7 && months == 0 && years == 0)
        return {
          messege: `منذ ${days} يوم`,
          class: 'badge dangerBadge',
        };
      // after
      if (days < -1 && days < -7 && months == -1 && years == -1)
        return {
          messege: `بعد ${days} يوم`,
          class: 'badge dangerBadge borderRight-success',
        };

      /* // a week ago */
      // befor
      if (days == 7 && months == 0 && years == 0)
        return { messege: 'منذ اسبوع', class: 'badge dangerBadge' };
      // after
      if (days == -7 && months == -1 && years == -1)
        return {
          messege: 'بعد اسبوع',
          class: 'badge dangerBadge borderRight-success',
        };

      // befor
      if (days > 7 && months == 0 && years == 0)
        return {
          messege: `منذ ${days} يوم`,
          class: 'badge dangerBadge',
        };
      // after
      if (days < -7 && months == -1 && years == -1)
        return {
          messege: `بعد ${days} يوم`,
          class: 'badge dangerBadge borderRight-success',
        };

      // from month
      if (months == 1 && years == 0)
        return { messege: 'منذ شهر', class: 'badge dangerBadge' };
      if (months == -1 && years == -1)
        return {
          messege: 'بعد شهر',
          class: 'badge dangerBadge borderRight-success',
        };


      // less more then month less than year
      if (months > 1 && years == 0)
        return { messege: `منذ ${months} اشهر`, class: 'badge dangerBadge' };
      if (months < -1 && years == -1)
        return {
          messege: `بعد ${months} اشهر`,
          class: 'badge dangerBadge borderRight-success',
        };

      // more than year
      if (years > 0)
        return { messege: `منذ ${years} عام`, class: 'badge dangerBadge' };
      if (years < -1)
        return {
          messege: `بعد ${years} عام`,
          class: 'badge dangerBadge borderRight-success',
        };

      return { messege: '', class: '' };
    };

    //let a = calcDate(today, past);
    return calcDate(today, past);
  }
}
