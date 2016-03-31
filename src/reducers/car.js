import * as types from '../constants/actionTypes';

const initialState = {
    cars: [],
    carsLoaded: false,
    selectedCar: '',
    days: 1
};

export default function car(state = initialState, action) {
    switch (action.type) {
        case types.SET_CARS:
            return Object.assign({}, state, {cars: action.cars, carsLoaded: true});
        case types.SELECT_CAR:
            return Object.assign({}, state, {selectedCar: action.id});
        case types.SET_CARS_SORT:
            return Object.assign({}, state, {sorting: {field: action.field, asc: action.asc}});
        default:
            return state;
    }
}
