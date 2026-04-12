import { Pipe, PipeTransform } from '@angular/core';
import { COMMON_ACRONYMS, FITNESS_ACRONYMS } from '../../../assets/scripts/ficheroSiglas';

@Pipe({ name: 'primeraLetra' })
export class PrimeraLetraPipe implements PipeTransform {
  
  private acronyms = [...FITNESS_ACRONYMS, ...COMMON_ACRONYMS];
  //Se asegura de que las siglas estén por sí solas y no que la combinación de letras sea parte de una palabra entera.
  private acronymRegex = new RegExp(
    `\\b(${this.acronyms.join('|')})\\b`, 'gi'
  );

  transform(value: string): string {
    if (!value) return '';

    return value
      .toLowerCase()
      .split(' ')
      .map((word, index) => {
        if (index === 0) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        if (this.acronymRegex.test(word)) {
          return word.toUpperCase();
        }
        return word.toLowerCase();
      })
      .join(' ');
  }
}