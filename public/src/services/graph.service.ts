import { Injectable } from '@angular/core';
import { CancelablePromise, DefaultService, GetGraphResponse } from 'src/generated';

@Injectable({
  providedIn: 'root'
})
export class GraphService {
  getGraph(): CancelablePromise<GetGraphResponse> {
    return DefaultService.getGraph();
  }
}
