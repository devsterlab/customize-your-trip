import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setCities, getCities } from '../actions/city';
import { setFlights, getFlights } from '../actions/flight';
import { setHotels, getHotels } from '../actions/hotel';
import { setCars, getCars } from '../actions/car';
import Header from '../components/Header';
import Progress from '../components/Progress';
import ConnectError from '../components/ConnectError';

class App extends Component {
    static propTypes = {
        children: PropTypes.element,
        location: PropTypes.object,
        connected: PropTypes.bool,
        selectedFlight: PropTypes.string,
        selectedHotel: PropTypes.string,
        selectedCar: PropTypes.string,
        steps: PropTypes.array
    };

    constructor(props) {
        super(props);

        this.state = {};
        this.loadData(props);
    }

    componentWillReceiveProps(props) {
        this.loadData(props);
    }

    loadData(props) {
        if (props.connected && !this.dataLoaded) {
            this.dataLoaded = true;
            let loadState = {}, flightsIds = [], hotelsIds = [], carsIds = [];

            for (let i = 0; i < this.props.steps.length; i++) {
                let step = this.props.steps[i];
                step.flight && flightsIds.push(step.flight);
                step.hotel && hotelsIds.push(step.hotel);
                step.car && carsIds.push(step.car);
            }

            props.selectedFlight && flightsIds.push(props.selectedFlight);
            props.selectedHotel && hotelsIds.push(props.selectedHotel);
            props.selectedCar && carsIds.push(props.selectedCar);

            if (flightsIds.length) {
                props.actions.getFlights({
                    data: {id: flightsIds},
                    action: setFlights,
                    callback: (flights) => {
                        if (flights.length) {
                            this.setState({flightsLoaded: true});
                            props.actions.getCities({
                                data: {id: [flights[0].fromCity._id].concat(flights.map(f => f.toCity._id))},
                                action: setCities,
                                callback: () => this.setState({citiesLoaded: true})
                            });
                        }
                        else this.setState({flightsLoaded: true, citiesLoaded: true});
                    }
                });
            }
            else {
                loadState.flightsLoaded = true;
                loadState.citiesLoaded = true;
            }

            if (hotelsIds.length) {
                props.actions.getHotels({
                    data: {id: hotelsIds},
                    action: setHotels,
                    callback: () => this.setState({hotelsLoaded: true})
                });
            }
            else loadState.hotelsLoaded = true;

            if (carsIds.length) {
                props.actions.getCars({
                    data: {id: carsIds},
                    action: setCars,
                    callback: () => this.setState({carsLoaded: true})
                });
            }
            else loadState.carsLoaded = true;

            this.setState(loadState);
        }
    }

    isDataLoaded() {
        return this.state.citiesLoaded && this.state.flightsLoaded && this.state.hotelsLoaded && this.state.carsLoaded;
    }

    render() {
        return (
            <div className="row height-100">
                <div className="height-100">
                    <Header location={this.props.location}/>

                    <div className="tabs-content nav-tabs">
                        <div className="tabs-panel is-active height-100">
                            <Progress loaded={this.isDataLoaded() || this.props.connected === false} />
                            {this.props.connected && this.isDataLoaded() && this.props.children
                                || (this.props.connected === false) && <ConnectError />}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        connected: state.summary.connected,
        selectedFlight: state.flight.selectedFlight,
        selectedHotel: state.hotel.selectedHotel,
        selectedCar: state.car.selectedCar,
        steps: state.summary.steps
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            setCities, getCities,
            setFlights, getFlights,
            setHotels, getHotels,
            setCars, getCars
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
