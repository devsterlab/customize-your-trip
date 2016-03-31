import * as types from '../constants/actionTypes';

export function setCars(cars) {
    return { type: types.SET_CARS, cars };
}

export function selectCar(id) {
    return { type: types.SELECT_CAR, id };
}

export function setCarsSort(field, asc) {
    return { type: types.SET_CARS_SORT, field, asc };
}
