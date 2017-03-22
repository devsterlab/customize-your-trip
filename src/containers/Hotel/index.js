import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as hotelActions from '../../actions/hotel';
import {flightCity} from '../../reducers';
import DateHelper from '../../util/dateHelper';
import TripMap from '../../components/TripMap';
import HotelCard from '../../components/HotelCard';
import HotelsSort from './HotelsSort';
import Button from '../../components/Button';
import IconButton from '../../components/IconButton';
import Modal from '../../components/Modal';
import HotelInfo from '../../components/HotelInfo';
import InputNumber from '../../components/InputNumber';

class Hotel extends Component {
    static propTypes = {
        children: PropTypes.node,
        actions: PropTypes.shape({
            setHotelsSort: PropTypes.func,
            selectHotel: PropTypes.func,
            setHotelDays: PropTypes.func
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
        hotels: PropTypes.object,
        currentHotels: PropTypes.array,
        selectedHotel: PropTypes.string,
        selectedFlight: PropTypes.string,
        sorting: PropTypes.object,
        days: PropTypes.number,
        maxDays: PropTypes.number,
        date: PropTypes.object
    };

    static defaultProps = {
        city: {
            bounds: {}
        },
        sorting: {
            field: 'popularity',
            asc: false
        },
        maxDays: 99
    };

    constructor(props) {
        super(props);

        this.selectedHotel = props.hotels[props.selectedHotel];
        if (!props.currentHotels || !props.currentHotels.length) this.fetchCityHotels(props);

        this.state = {hotels: this.getHotels(props), hotelInfo: null, hideSelected: false};

        this.selectHotel = this._selectHotel.bind(this);
        this.handleHotelInfoClick = this._handleHotelInfoClick.bind(this);
        this.handleSortChange = this._handleSortChange.bind(this);
    }

    componentWillReceiveProps(props) {
        if (props.currentHotels && (props.currentHotels != this.props.currentHotels)) {
            this.setState({hotels: this.getHotels(props)});
        }
    }

    getHotels(props) {
        return props.currentHotels && props.currentHotels.map(id => props.hotels[id]) || [];
    }

    fetchCityHotels(props, sorting) {
        props.city &&
        props.actions.getCityHotels(props.city._id, sorting || props.sorting);
    }

    _handleSortChange(field, asc) {
        this.fetchCityHotels(this.props, {field, asc});
        this.props.actions.setHotelsSort(field, asc);
    }

    _selectHotel(hotel, closeDialog) {
        this.selectedHotel = hotel;
        if (closeDialog) this.closeDialog();
        this.props.actions.selectHotel(hotel._id);
    }

    _handleHotelInfoClick(hotelInfo) {
        this.setState({hotelInfo});
    }

    closeDialog() {
        this.setState({hotelInfo: null});
    }

    render() {
        let {date} = this.props;
        return (
            this.props.selectedFlight &&
            <div className="height-100">
                <div className="hotel-header">
                    <div className="inline">
                        <h3>{this.props.city.name}</h3>
                        <span>
                            Day 1-{this.props.days}&nbsp;
                            ({DateHelper.formatDateMonth(date)}
                            - {DateHelper.formatDateMonth(DateHelper.addDays(date, this.props.days))})
                        </span>
                    </div>
                    <Button
                        className="success float-right large continue-button"
                        disabled={!this.selectedHotel}
                        link="/car"
                    >Continue</Button>
                </div>

                <hr/>

                <div className="row hotels-search">
                    <div className="medium-7 columns map-wrap">
                        <TripMap
                            city={this.props.city}
                            hotels={this.state.hotels}
                            selectedHotel={this.selectedHotel}
                            onMarkerClick={this.selectHotel}
                        />
                    </div>

                    <div className="medium-5 columns">
                        {this.selectedHotel &&
                        <div className={this.state.hideSelected && 'hide' || ''}>
                            <div>
                                <h4 className="inline">Current selection</h4>
                                <div className="inline days">
                                    <span>Days to stay:</span>
                                    <InputNumber
                                        className="inline"
                                        min={1}
                                        max={this.props.maxDays}
                                        value={this.props.days}
                                        onChange={num => this.props.actions.setHotelDays(num)}
                                    />
                                </div>
                            </div>
                            <HotelCard
                                hotel={this.selectedHotel}
                                className="selected"
                                price={this.props.days * this.selectedHotel.price}
                                onInfoClick={this.handleHotelInfoClick}
                            />
                            <hr className="selection-hr"/>
                        </div>}

                        <div>
                            <h4 className="select-hotel">
                                {this.selectedHotel && 'Select another hotel' || 'Select hotel'}
                            </h4>
                            <IconButton
                                className={`expand-btn ${this.state.hideSelected && 'mdi-chevron-down' || 'mdi-chevron-up'}`}
                                onClick={() => this.setState({hideSelected: !this.state.hideSelected})}
                            />
                        </div>

                        <HotelsSort sorting={this.props.sorting} onSortChange={this.handleSortChange}/>
                        <ul className={`hotels-list ${this.selectedHotel && 'selected' || ''} ${this.state.hideSelected && 'expanded' || ''}`}>
                            {this.state.hotels.map((hotel, index) =>
                                <HotelCard
                                    className={`${index == this.props.hotels.length - 1 && 'last' || ''} ${this.selectedHotel && (hotel._id == this.selectedHotel._id) && 'selected'} || ''`}
                                    key={hotel._id}
                                    hotel={hotel}
                                    onClick={this.selectHotel}
                                    onInfoClick={this.handleHotelInfoClick}
                                />
                            )}
                        </ul>
                    </div>
                </div>

                <Modal
                    closeButton
                    className="large"
                    show={!!this.state.hotelInfo}
                    onClose={() => this.closeDialog()}
                >
                    <HotelInfo
                        hotel={this.state.hotelInfo}
                        onSelect={hotel => this.selectHotel(hotel, true)}
                    />
                </Modal>
            </div>
            ||
            <div className="height-100">
                <h2 className="subheader text-center">Flight not selected</h2>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        city: flightCity(state),
        hotels: state.hotel.hotels,
        currentHotels: state.hotel.currentHotels,
        selectedHotel: state.hotel.selectedHotel,
        selectedFlight: state.flight.selectedFlight,
        sorting: state.hotel.sorting,
        days: state.hotel.days,
        date: state.summary.date
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(hotelActions, dispatch)
    };
}

export default connect(
    mapStateToProps, mapDispatchToProps
)(Hotel);
