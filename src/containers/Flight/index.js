import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {setCities, selectCity, getCities} from '../../actions/city';
import * as flightActions from '../../actions/flight';
import CitiesSearch from './CitiesSearch';
import FlightCard from '../../components/FlightCard';
import FlightsSort from './FlightsSort';
import Button from '../../components/Button';

class Flight extends Component {
    static propTypes = {
        actions: PropTypes.shape({
            setFlightsNotSearched: PropTypes.func,
            getCurrentFlights: PropTypes.func,
            getCities: PropTypes.func,
            selectCity: PropTypes.func,
            setFlightsSort: PropTypes.func,
            selectFlight: PropTypes.func
        }),
        cities: PropTypes.object,
        flights: PropTypes.object,
        currentFlights: PropTypes.arrayOf(PropTypes.string),
        children: PropTypes.node,
        selectedCityFrom: PropTypes.string,
        selectedCityTo: PropTypes.string,
        sorting: PropTypes.object,
        selectedFlight: PropTypes.string,
        date: PropTypes.object,
        homeCity: PropTypes.string,
        lastCityFrom: PropTypes.string,
        lastCityTo: PropTypes.string,
        notSearched: PropTypes.bool
    };

    static defaultProps = {
        sorting: {
            field: 'departTime',
            asc: true
        }
    };

    constructor(props) {
        super(props);

        this.selectedFlight = props.flights[props.selectedFlight];
        if (!props.currentFlights || !props.currentFlights.length) this.fetchCurrentFlights(props);

        this.state = {canSearch: false};

        this.handleCityChange = this._handleCityChange.bind(this);
        this.handleFlightsSearch = this._handleFlightsSearch.bind(this);
        this.handleSortChange = this._handleSortChange.bind(this);
        this.selectFlight = this._selectFlight.bind(this);
    }

    /*    componentWillReceiveProps(props) {
     if (props.selectedFlight && props.selectedFlight != this.props.selectedFlight) {

     }
     }*/

    componentWillMount() {
        if (!this.props.selectedCityFrom || !this.props.selectedCityTo) {
            this.props.actions.setFlightsNotSearched(true);
        }
    }

    fetchCurrentFlights(props, sorting) {
        props.selectedCityFrom && props.selectedCityTo &&
        props.actions.getCurrentFlights(props.selectedCityFrom, props.selectedCityTo, sorting || props.sorting);
    }

    fetchFlightCity(flight) {
        flight && !this.props.cities[flight.toCity._id] &&
        this.props.actions.getCities({data: {id: flight.toCity._id}, action: setCities});
    }

    _handleCityChange(cityId, fromTo, canSearch) {
        this.setState({canSearch});
        this.props.actions.selectCity(cityId, fromTo);
    }

    _handleFlightsSearch() {
        this.fetchCurrentFlights(this.props);
        this.props.actions.setFlightsNotSearched();
    }

    _handleSortChange(field, asc) {
        this.fetchCurrentFlights(this.props, {field, asc});
        this.props.actions.setFlightsSort(field, asc);
    }

    clearSelections(current, prev) {
        return !(current && prev && (current.fromCity._id == prev.fromCity._id) && (current.toCity._id == prev.toCity._id));
    }

    _selectFlight(flight) {
        this.props.actions.selectFlight(flight, this.clearSelections(flight, this.selectedFlight));
        this.selectedFlight = flight;
        this.fetchFlightCity(this.selectedFlight);
    }

    selectCitiesHeaderHide() {
        return this.state.canSearch || this.props.currentFlights.length || this.props.selectedFlight || !this.props.notSearched;
    }

    hideFlightsResults() {
        return !this.selectCitiesHeaderHide() || (this.props.notSearched && !this.props.selectedFlight);
    }

    canFinish() {
        return this.selectedFlight && this.selectedFlight.toCity._id == this.props.homeCity;
    }

    render() {
        return (
            <div className="height-100 flight-page">
                <CitiesSearch
                    selectedCityFrom={this.props.selectedCityFrom}
                    selectedCityTo={this.props.selectedCityTo}
                    lastCityFrom={this.props.lastCityFrom}
                    lastCityTo={this.props.lastCityTo}
                    onCityChange={this.handleCityChange}
                    onFlightsSearch={this.handleFlightsSearch}
                    getCities={this.props.actions.getCities}
                />

                <hr/>

                <div className="flights-search">
                    <h3 className={`text-center subheader ${this.selectCitiesHeaderHide() && 'hide' || ''}`}>
                        Select cities to start
                    </h3>

                    <div className={this.hideFlightsResults() && 'hide' || ''}>
                        <div className="medium-8 columns flights-results">
                            <FlightsSort sorting={this.props.sorting} onSortChange={this.handleSortChange}/>
                            {this.props.currentFlights.length &&
                            <ul className="flights-list">
                                {this.props.currentFlights.map(id =>
                                    <FlightCard
                                        key={id}
                                        flight={this.props.flights[id]}
                                        date={this.props.date}
                                        className={`${this.selectedFlight && (id == this.selectedFlight._id) && 'selected'} || ''`}
                                        onClick={this.selectFlight}
                                    />
                                )}
                            </ul> ||
                            (!this.props.notSearched &&
                            <h2 className="subheader">
                                Flights not found
                            </h2> || null)}
                        </div>

                        <div className="medium-4 columns selected-flight">
                            <h4>Current selection</h4>
                            {this.selectedFlight &&
                            <div>
                                <FlightCard
                                    flight={this.selectedFlight}
                                    small
                                    className="selected"
                                    date={this.props.date}
                                />
                                <Button className="expanded success large" link="/hotel">
                                    Continue
                                </Button>
                                {this.canFinish() &&
                                <Button className="expanded large" link="/summary">
                                    Finish
                                </Button>}
                            </div> ||
                            <h5 className="subheader">None selected</h5>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        cities: state.city.cities,
        flights: state.flight.flights,
        currentFlights: state.flight.currentFlights,
        selectedCityFrom: state.summary.lastCityFrom || state.city.selectedCityFrom,
        selectedCityTo: state.summary.lastCityTo || state.city.selectedCityTo,
        sorting: state.flight.sorting,
        selectedFlight: state.flight.selectedFlight,
        notSearched: state.flight.notSearched,
        date: state.summary.currentStep && state.summary.currentStep.date ||
        (state.summary.steps.length && state.summary.steps[0].dateTo) || state.summary.date,
        homeCity: state.summary.homeCity,
        lastCityFrom: state.summary.lastCityFrom,
        lastCityTo: state.summary.lastCityTo
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(Object.assign({selectCity, getCities}, flightActions), dispatch)
    };
}

export default connect(
    mapStateToProps, mapDispatchToProps
)(Flight);
