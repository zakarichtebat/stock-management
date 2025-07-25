import { Module, Global } from '@nestjs/common';
import { FormattersService } from './formatters';

@Global()
@Module({
  providers: [FormattersService],
  exports: [FormattersService],
})
export class UtilsModule {} 