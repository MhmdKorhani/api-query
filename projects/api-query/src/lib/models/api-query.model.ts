export class ApiQuery {
    page?: number;
    size?: number;
    sort?: string[];
    filter?: any;
    notInFilter?: any;
    search?: any;
    advancedSearch?: { [s: string]: any | any[] };
    findNull?: string[];
    greaterThan?: any;
    lessThan?: any;
    scheduleId?: string;
    params?: any;
}