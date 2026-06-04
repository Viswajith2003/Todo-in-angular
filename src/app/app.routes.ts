import { Routes } from '@angular/router';
import { Counter } from './counter/counter';
import { Todo } from './todo/todo';

export const routes: Routes = [
    {
        path:"counter",
        component:Counter
    },
    {
        path:"todo",
        component:Todo
    }
];
