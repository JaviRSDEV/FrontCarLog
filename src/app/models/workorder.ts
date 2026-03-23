import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export interface Workorder {
  id: number;
  status: string;
  description?: string
}
