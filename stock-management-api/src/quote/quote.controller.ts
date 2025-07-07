import { Controller, Get, Post, Body, Param, Put, HttpException, HttpStatus } from '@nestjs/common';
import { QuoteService } from './quote.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { QuoteStatus } from './quote.service';

@Controller('api/quotes')
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
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: keyof typeof QuoteStatus,
  ) {
    try {
      return await this.quoteService.updateStatus(+id, QuoteStatus[status]);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update quote status',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post(':id/convert')
  async convertToInvoice(@Param('id') id: string) {
    try {
      const result = await this.quoteService.convertToInvoice(+id);
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to convert quote to invoice',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 