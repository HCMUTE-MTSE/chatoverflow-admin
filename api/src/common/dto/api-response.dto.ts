import { PaginationDto } from './pagination.dto';

export class ApiResponseDto<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
  pagination?: PaginationDto;

  constructor(
    success: boolean,
    message: string,
    data?: T,
    pagination?: PaginationDto,
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
    if (pagination) {
      this.pagination = pagination;
    }
  }

  static success<T>(message: string, data?: T): ApiResponseDto<T> {
    return new ApiResponseDto(true, message, data);
  }

  static error(message: string): ApiResponseDto {
    return new ApiResponseDto(false, message);
  }

  static withPagination(message, data, page, limit, baseUrl, totalItems) {
    const pagination = PaginationDto.create(page, limit, baseUrl, totalItems);
    return new ApiResponseDto(true, message, data, pagination);
  }
}
