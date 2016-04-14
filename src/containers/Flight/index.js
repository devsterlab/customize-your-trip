import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { selectCity } from '../../actions/city';
import { selectFlight, setFlightsSort, setFlightsSearched } from '../../actions/flight';
import Sorting from '../../util/sorting';
import CitiesSearch from './CitiesSearch';
import FlightCard from '../../components/FlightCard';
import FlightsSort from './FlightsSort';
import Button from '../../components/Button';

class Flight extends Component {
    static propTypes = {
        children: PropTypes.node,
        cities: PropTypes.array,
        flights: PropTypes.array,
        selectedCityFrom: PropTypes.string,
        selectedCityTo: PropTypes.string,
        sorting: PropTypes.object,
        selectedFlight: PropTypes.string,
        actions: PropTypes.object,
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

        this.selectedFlight = props.flights.find(el => el._id == props.selectedFlight);
        this.state = {
            flights: this.sort(this.filterFlights(props.flights), props.sorting.field, props.sorting.asc)
        };

        this.handleCityChange = this._handleCityChange.bind(this);
        this.handleFlightsSearch = this._handleFlightsSearch.bind(this);
        this.handleSortChange = this._handleSortChange.bind(this);
        this.selectFlight = this._selectFlight.bind(this);
    }

    componentWillMount() {
        if (!this.props.selectedCityFrom || !this.props.selectedCityTo) this.props.actions.setFlightsSearched(true);
    }

    _handleCityChange(cityId, fromTo, canSearch) {
        this.setState({canSearch});
        this.props.actions.selectCity(cityId, fromTo);
    }

    _handleFlightsSearch() {
        this.setState({flights: this.sort(this.filterFlights())});
        this.props.actions.setFlightsSearched();
    }

    filterFlights(flights = this.props.flights) {
        if (flights) return flights
            .filter(el => el.fromCity._id == this.props.selectedCityFrom && el.toCity._id == this.props.selectedCityTo);
        return [];
    }

    sort(flights, field = this.props.sorting.field, asc = this.props.sorting.asc) {
        switch (field) {
            case 'price':
                return flights.sort(Sorting.byObjectFields(
                    [{field, asc}, {field: 'departTime', type: 'timeStr'}, {field: 'duration', type: 'timeStr'}]
                ));
            case 'duration':
                return flights.sort(Sorting.byObjectFields(
                    [{field, asc, type: 'timeStr'}, {field: 'price'}, {field: 'departTime', type: 'timeStr'}]
                ));
            case 'departTime':
                return flights.sort(Sorting.byObjectFields(
                    [{field, asc, type: 'timeStr'},  {field: 'price'}, {field: 'duration', type: 'timeStr'}]
                ));
        }
    }

    _handleSortChange(field, asc) {
        let flights = this.sort(this.state.flights, field, asc);
        this.setState({flights});
        this.props.actions.setFlightsSort(field, asc);
    }

    clearSelections(current, prev) {
        return !(current && prev && (current.fromCity._id == prev.fromCity._id) && (current.toCity._id == prev.toCity._id));
    }

    _selectFlight(flight) {
        this.props.actions.selectFlight(flight._id, this.clearSelections(flight, this.selectedFlight));
        this.selectedFlight = flight;
    }

    selectCitiesHeaderHide() {
        return this.state.canSearch || this.state.flights.length || this.props.selectedFlight;
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
                <CitiesSearch cities={this.props.cities} selectedCityFrom={this.props.selectedCityFrom}
                              selectedCityTo={this.props.selectedCityTo} lastCityFrom={this.props.lastCityFrom}
                              lastCityTo={this.props.lastCityTo} onCityChange={this.handleCityChange}
                              onFlightsSearch={this.handleFlightsSearch}/>
                <hr/>
                <div className="flights-search">
                    <h3 className={`text-center subheader ${this.selectCitiesHeaderHide() && 'hide' || ''}`}>
                        Select cities to start
                    </h3>
                    <div className={this.hideFlightsResults() && 'hide' || ''}>
                        <div className="medium-8 columns flights-results">
                            <FlightsSort sorting={this.props.sorting} onSortChange={this.handleSortChange} />
                            {this.state.flights.length &&
                            <ul className="flights-list">
                                {this.state.flights.map(flight =>
                                        <FlightCard key={flight._id} flight={flight} date={this.props.date}
                                                    onClick={this.selectFlight} />
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
                                <FlightCard flight={this.selectedFlight} small className="selected"
                                             date={this.props.date}/>
                                <Button className="expanded success large" link="/hotel">
                                    Continue
                                </Button>
                                {this.canFinish() &&
                                <Button className="expanded large" link="/summary">
                                    Finish
                                </Button>}
                            </div>||
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
        actions: bindActionCreators({selectCity, selectFlight, setFlightsSort, setFlightsSearched}, dispatch)
    };
}

export default connect(
    mapStateToProps, mapDispatchToProps
)(Flight);
