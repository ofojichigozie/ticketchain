import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { ConfirmSaleDto } from './dto/confirm-sale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../common/dto/api-response.dto';

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get()
  async findAll() {
    const listings = await this.marketplaceService.findAllActive();
    return ApiResponse.success(listings, 'Active listings retrieved');
  }

  @Get(':listingId')
  async findOne(@Param('listingId') listingId: string) {
    const listing = await this.marketplaceService.findOne(listingId);
    return ApiResponse.success(listing, 'Listing retrieved successfully');
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createListing(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateListingDto,
  ) {
    const listing = await this.marketplaceService.createListing(
      user.userId,
      dto,
    );
    return ApiResponse.success(listing, 'Listing created successfully');
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':listingId')
  async cancelListing(
    @Param('listingId') listingId: string,
    @CurrentUser() user: { userId: string },
  ) {
    const listing = await this.marketplaceService.cancelListing(
      listingId,
      user.userId,
    );
    return ApiResponse.success(listing, 'Listing cancelled successfully');
  }

  @UseGuards(JwtAuthGuard)
  @Post(':listingId/confirm-resale-purchase')
  async confirmResalePurchase(
    @Param('listingId') listingId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: ConfirmSaleDto,
  ) {
    const listing = await this.marketplaceService.confirmResalePurchase(
      listingId,
      user.userId,
      dto,
    );
    return ApiResponse.success(
      listing,
      'Resale purchase confirmed successfully',
    );
  }
}
