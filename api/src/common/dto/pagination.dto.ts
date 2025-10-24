export class PaginationDto {
  page: number;
  limit: number;
  nexturl?: string;

  constructor(page: number = 1, limit: number = 10, nexturl?: string) {
    this.page = page;
    this.limit = limit;
    this.nexturl = nexturl;
  }
  static create(page, limit, baseUrl, totalItems) {
    let nextUrl = null;

    if (page * limit < totalItems) {
      nextUrl = `${baseUrl}?page=${page + 1}&limit=${limit}`;
    }

    return new PaginationDto(page, limit, nextUrl);
  }
}
