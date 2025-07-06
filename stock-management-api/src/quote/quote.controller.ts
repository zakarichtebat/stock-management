import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { QuoteService } from './quote.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { QuoteStatus } from './quote.service';

@Controller('quotes')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post()
  create(@Body() createQuoteDto: CreateQuoteDto) {
    return this.quoteService.create(createQuoteDto);
  }

  @Get()
  findAll() {
    return this.quoteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quoteService.findOne(+id);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: keyof typeof QuoteStatus,
  ) {
    return this.quoteService.updateStatus(+id, QuoteStatus[status]);
  }

  @Post(':id/convert')
  convertToInvoice(@Param('id') id: string) {
    return this.quoteService.convertToInvoice(+id);
  }
} 