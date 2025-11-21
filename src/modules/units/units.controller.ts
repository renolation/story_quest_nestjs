import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { UnitsService } from './units.service';
import { CreateUnitDto, UpdateUnitDto, UnitResponseDto } from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserRole } from '../../common/enums';

@ApiTags('Units')
@ApiBearerAuth()
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.CENTER, UserRole.AGENCY)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new unit',
    description: 'Create a new unit within a chapter (requires Teacher, Center, or Agency role)',
  })
  @ApiBody({ type: CreateUnitDto })
  @ApiResponse({
    status: 201,
    description: 'Unit created successfully',
    type: UnitResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Parent chapter not found' })
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
    @Query('chapterId', new ParseIntPipe({ optional: true })) chapterId?: number,
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
    @Param('id', ParseIntPipe) id: number,
    @Query('includeLevels') includeLevels?: string,
  ): Promise<UnitResponseDto> {
    return this.unitsService.findOne(id, user.id, includeLevels === 'true');
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.CENTER, UserRole.AGENCY)
  @ApiOperation({
    summary: 'Update a unit',
    description: 'Update unit details (requires Teacher, Center, or Agency role)',
  })
  @ApiBody({ type: UpdateUnitDto })
  @ApiResponse({
    status: 200,
    description: 'Unit updated successfully',
    type: UnitResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUnitDto: UpdateUnitDto,
  ) {
    return this.unitsService.update(id, updateUnitDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.AGENCY)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a unit',
    description: 'Delete a unit (requires Agency role only - will cascade delete all levels and questions)',
  })
  @ApiResponse({ status: 204, description: 'Unit deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only Agency can delete units' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.unitsService.remove(id);
  }
}
