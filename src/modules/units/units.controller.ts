import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { UnitResponseDto } from './dto/unit-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Units')
@ApiBearerAuth()
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUnitDto: CreateUnitDto) {
    return this.unitsService.create(createUnitDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all units with user progress',
    description: 'Retrieves units with the authenticated user\'s progress data. Optionally filter by chapterId',
  })
  @ApiResponse({
    status: 200,
    description: 'Units retrieved successfully with progress',
    type: [UnitResponseDto],
  })
  @ApiQuery({
    name: 'chapterId',
    required: false,
    type: String,
    description: 'Filter units by chapter ID',
  })
  @ApiQuery({
    name: 'includeLevels',
    required: false,
    type: String,
    description: 'Set to "true" to include nested levels',
  })
  findAll(
    @CurrentUser() user: any,
    @Query('chapterId') chapterId?: string,
    @Query('includeLevels') includeLevels?: string,
  ): Promise<UnitResponseDto[]> {
    return this.unitsService.findAll(user.id, chapterId, includeLevels === 'true');
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a unit by ID with user progress',
    description: 'Retrieves a specific unit with the authenticated user\'s progress data',
  })
  @ApiResponse({
    status: 200,
    description: 'Unit retrieved successfully with progress',
    type: UnitResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  @ApiQuery({
    name: 'includeLevels',
    required: false,
    type: String,
    description: 'Set to "true" to include nested levels',
  })
  findOne(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeLevels') includeLevels?: string,
  ): Promise<UnitResponseDto> {
    return this.unitsService.findOne(id, user.id, includeLevels === 'true');
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUnitDto: UpdateUnitDto,
  ) {
    return this.unitsService.update(id, updateUnitDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.unitsService.remove(id);
  }
}
