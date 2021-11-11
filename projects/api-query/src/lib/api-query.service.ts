import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiQuery } from './models/api-query.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiQueryService {

  baseUrl: string;


  constructor(private http: HttpClient) { }

  setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  count(url: string, queryParams?: ApiQuery): Observable<any> {
    let httpParams = this.getHttpParams(queryParams);
    let body: any = { params: httpParams, observe: 'body' };
    return this.http.get(`${this.baseUrl}${url}/count`, body).pipe(map((response) => {
      return response;
    }));
  }

  create(url: string, obj: any, queryParams?: ApiQuery): Observable<any> {
    let httpParams = this.getHttpParams(queryParams);
    let body: any = { params: httpParams, }
    return this.http.post<any>(`${this.baseUrl}${url}`, obj, body)
      .pipe(map(response => { return response; }));
  }

  delete(url: string, id: any): Observable<any> {
    return this.http.delete(`${this.baseUrl}${url}/${id}`)
      .pipe(map(response => { return response }));
  }

  find(url: string, id: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${url}/${id}`)
      .pipe(map(response => { return response; }));
  }

  putfind(url: string, id: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}${url}/${id}`, null)
      .pipe(map(response => { return response; }));
  }

  query(url: string, queryParams?: ApiQuery, getheaders: boolean = false): Observable<any> {
    let httpParams = this.getHttpParams(queryParams);
    let body: any = (!getheaders) ? { params: httpParams, observe: 'body' } : { params: httpParams, observe: 'response' };
    const api: string = queryParams?.search ? `${this.baseUrl}${url}/search` : `${this.baseUrl}${url}`;
    return this.http.get(api, body).pipe(map((response) => {
      return response;
    }));
  }

  update(url: string, obj: any, id: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}${url}/${id}`, obj)
      .pipe(map(response => { return response; }));
  }

  private getHttpParams = (queryParams?: ApiQuery): HttpParams => {
    let params: HttpParams = new HttpParams();
    const specialParams = ['sort', 'advancedSearch', 'search', 'notInFilter', 'filter', 'findNull', 'greaterThan', 'lessThan', 'params'];
    if (queryParams) {
      Object.keys(queryParams).forEach(key => {
        if (!specialParams.includes(key)) {
          params = params.set(key, queryParams[key]);
        }
      });
      if (queryParams.sort) {
        queryParams.sort.forEach((val: string) => {
          params = params.append('sort', val);
        });
      }
      if (queryParams.params) {
        for (let [key, value] of queryParams.params) {
          params = params.append(key, value);
        }
      }
      if (queryParams.search) {
        for (let [key, value] of queryParams.search) {
          params = params.append(key + ".contains", value)
        }
      } else
        if (queryParams.advancedSearch) {
          let filters = queryParams.advancedSearch;
          Object.keys(filters).forEach(key => {
            let colFilter = filters[key]
            let colValue = colFilter['value']
            let matchMode = colFilter['matchMode']
            if (matchMode === 'equals') {
              if (colValue.startsWith('*') && colValue.endsWith('*')) {
                colValue = colValue.split('*')[1]
                matchMode = 'contains'
                params = params.append(key + "." + matchMode, colValue)
              } else if (colValue.startsWith('*')) {
                matchMode = 'endsWith'
                let colValues = colValue.split('*');
                colValue = colValues[colValues.length - 1]
                params = params.append(key + "." + matchMode, colValue)
              } else if (colValue.endsWith('*')) {
                matchMode = 'startsWith'
                colValue = colValue.split('*')[0]
                params = params.append(key + "." + matchMode, colValue)
              } else if (colValue.indexOf('*') !== -1) {
                let values = colValue.split('*')
                params = params.append(key + "." + 'startsWith', values[0])
                params = params.append(key + "." + 'endsWith', values[values.length - 1])
              } else {
                params = params.append(key + "." + matchMode, colValue)
              }
            }
            else if (matchMode === 'between') {
              params = params.append(key + ".greaterThanOrEqual", colValue[0]);
              params = params.append(key + ".lessThanOrEqual", colValue[1]);
            }
            else if (matchMode === 'list') {
              if (colValue instanceof Array) {
                params = params.append(key + ".in", colValue.toString());
              }
              else {
                params = params.append(key + ".equals", colValue);
              }
            }
            else if (matchMode === 'check') {
              params = params.append(key + ".equals", colValue);
            }
            else {
              params = params.append(key + "." + matchMode, colValue)
            }
          })
        }
      if (queryParams.filter) {
        for (let [key, value] of queryParams.filter) {
          if (value instanceof Array) {
            params = params.append(key + ".in", value.toString());
          }
          else {
            params = params.append(key + ".equals", value);
          }
        }
      }
      if (queryParams.notInFilter) {
        for (let [key, value] of queryParams.notInFilter) {
          if (value instanceof Array) {
            params = params.append(key + ".notIn", value.toString());
          }
          else {
            params = params.append(key + ".notEquals", value);
          }
        }
      }
      if (queryParams.findNull) {
        for (let key of queryParams.findNull) {
          params = params.append(key + ".specified", 'false');
        }
      }
      if (queryParams.greaterThan) {
        for (let [key, value] of queryParams.greaterThan) {
          params = params.append(key + ".greaterThanOrEqual", value);
        }
      }
      if (queryParams.lessThan) {
        for (let [key, value] of queryParams.lessThan) {
          params = params.append(key + ".lessThanOrEqual", value);
        }
      }
    }
    else {
      let x = 999999;
      params = params.set('size', x.toString());
    }
    return params;
  };
}