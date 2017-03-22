import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {flightCity} from '../../reducers';
import * as actions from '../../actions/car';
import DateHelper from '../../util/dateHelper';
import CarCard from '../../components/CarCard';
import Button from '../../components/Button';
import CarsSort from './CarsSort';
import IconButton from '../../components/IconButton';
import Filtering from './Filtering';
import InputNumber from '../../components/InputNumber';

class Car extends Component {
    static propTypes = {
        children: PropTypes.node,
        actions: PropTypes.shape({
            setCarsSort: PropTypes.func,
            selectCar: PropTypes.func,
            setCarsFilters: PropTypes.func,
            setCarDays: PropTypes.func,
            getCityCars: PropTypes.func
        }),
        city: PropTypes.shape({
            _id: PropTypes.string,
            name: PropTypes.string,
            bounds: PropTypes.shape({
                south: PropTypes.number, west: PropTypes.number,
                north: PropTypes.number, east: PropTypes.number
            }),
            timezone: PropTypes.string
        }),
        cars: PropTypes.object,
        currentCars: PropTypes.array,
        selectedHotel: PropTypes.string,
        selectedCar: PropTypes.string,
        sorting: PropTypes.object,
        hotelDays: PropTypes.number,
        carDays: PropTypes.number,
        maxDays: PropTypes.number,
        filters: PropTypes.object,
        date: PropTypes.object
    };

    static defaultProps = {
        city: {
            bounds: {}
        },
        sorting: {
            field: 'brand',
            asc: true
        },
        filters: {},
        maxDays: 99
    };

    constructor(props) {
        super(props);

        this.selectedCar = props.cars[props.selectedCar];
        if (!props.currentCars || !props.currentCars.length) this.fetchCityCars(props);

        this.state = this.newCarsState(props);

        this.selectCar = this._selectCar.bind(this);
        this.handleSortChange = this._handleSortChange.bind(this);
        this.handleFilterChange = this._handleFilterChange.bind(this);
    }

    componentWillReceiveProps(props) {
        if (props.currentCars && (props.currentCars != this.props.currentCars)) {
            this.setState(this.newCarsState(props));
        }
    }

    getCars(props) {
        return props.currentCars && props.currentCars.map(id => props.cars[id]) || [];
    }

    newCarsState(props) {
        let cars = this.getCars(props);
        return {
            brands: this.readAvailableTypes(cars, 'brand'),
            models: this.readAvailableTypes(cars, 'model'),
            carTypes: this.readAvailableTypes(cars, 'carType'),
            cars
        };
    }

    fetchCityCars(props, sorting, filters) {
        props.city &&
        props.actions.getCityCars(props.city._id, sorting || props.sorting, filters || props.filters);
    }

    _handleSortChange(field, asc) {
        this.fetchCityCars(this.props, {field, asc});
        this.props.actions.setCarsSort(field, asc);
    }

    _selectCar(car) {
        this.selectedCar = car;
        this.props.actions.selectCar(car && car._id);
    }

    readAvailableTypes(cars, field) {
        let keys = {}, res = [];
        for (let car of cars) {
            if (!keys[car[field]]) {
                keys[car[field]] = 1;
                res.push({name: car[field]});
            }
        }
        return res;
    }

    _handleFilterChange(type, value) {
        if (this.props.filters[type] == (value && value.name)) {
            if (!value) this.setState({['error' + type]: 'Not found'});
            return;
        }

        let filters = Object.assign({}, this.props.filters), errors;

        if (!value) {
            delete filters[type];
            errors = {['error' + type]: 'Not found'};
        }
        else {
            Object.assign(filters, {[type]: value.name});
            errors = {['error' + type]: null};
        }

        if (this.props.filters.brand != filters.brand) {
            delete filters.model;
        }

        this.fetchCityCars(this.props, this.props.sorting, filters);
        this.setState(errors);
        this.props.actions.setCarsFilters(filters);
    }

    render() {
        return (
            this.props.selectedHotel &&
            <div className="height-100">
                <div className="car-header">
                    <div className="inline">
                        <h3>{this.props.city.name}</h3>
                        <span>
                            Day 1-{this.props.hotelDays}&nbsp;
                            ({DateHelper.formatDateMonth(this.props.date)} -&nbsp;
                            {DateHelper.formatDateMonth(DateHelper.addDays(this.props.date, Math.max(this.props.hotelDays, this.props.carDays)))})
                        </span>
                    </div>
                    <Button className="success float-right large continue-button" link="/summary">
                        {this.selectedCar && 'Continue' || 'Skip'}
                    </Button>
                </div>

                <hr/>

                <div className="row cars-search">
                    <Filtering
                        filters={this.props.filters}
                        brands={this.state.brands}
                        models={this.state.models}
                        carTypes={this.state.carTypes}
                        errorbrand={this.state.errorbrand}
                        errormodel={this.state.errormodel}
                        errorcarType={this.state.errorcarType}
                        onFilterChange={this.handleFilterChange}
                    />

                    <div className="medium-5 columns cars-list-wrap">
                        <CarsSort sorting={this.props.sorting} onSortChange={this.handleSortChange}/>
                        {this.state.cars.length && <ul className="cars-list">
                            {this.state.cars.map(car =>
                                <CarCard
                                    key={car._id}
                                    car={car}
                                    onClick={this.selectCar}
                                    className={`${this.selectedCar && (car._id == this.selectedCar._id) && 'selected'} || ''`}
                                />
                            )}
                        </ul>
                        ||
                        <h3 className="subheader">Cars not found</h3>}
                    </div>

                    <div className="medium-4 columns selection">
                        <h4 className="inline">Current selection</h4>
                        {this.selectedCar &&
                        <IconButton
                            className="mdi-close-circle float-right clear"
                            title="Clear selection"
                            onClick={() => this.selectCar(null)}
                        />}
                        {this.selectedCar &&
                        <div>
                            <CarCard
                                car={this.selectedCar}
                                className="selected"
                                price={this.props.carDays * this.selectedCar.price}
                            />
                            <div className="inline days float-right ">
                                <span>Days to drive:</span>
                                <InputNumber
                                    className="inline"
                                    min={1}
                                    max={this.props.maxDays}
                                    value={this.props.carDays}
                                    onChange={(num) => this.props.actions.setCarDays(num)}
                                />
                            </div>
                        </div>
                        ||
                        <h3 className="subheader">None selected</h3>}
                    </div>
                </div>
            </div>
            ||
            <div className="height-100"><h2 className="subheader text-center">You should select hotel first</h2></div>
        );
    }
}

function mapStateToProps(state) {
    return {
        city: flightCity(state),
        cars: state.car.cars,
        currentCars: state.car.currentCars,
        selectedHotel: state.hotel.selectedHotel,
        selectedCar: state.car.selectedCar,
        sorting: state.car.sorting,
        hotelDays: state.hotel.days,
        carDays: state.car.days,
        filters: state.car.filters,
        date: state.summary.date
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

export default connect(
    mapStateToProps, mapDispatchToProps
)(Car);
