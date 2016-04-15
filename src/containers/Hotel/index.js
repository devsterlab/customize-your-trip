import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { selectHotel, setHotelsSort, setHotelDays } from '../../actions/hotel';
import { flightCity } from '../../reducers';
import DateHelper from '../../util/dateHelper';
import Sorting from '../../util/sorting';
import TripMap from '../../components/TripMap';
import HotelCard from '../../components/HotelCard';
import HotelsSort from './HotelsSort';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import HotelInfo from '../../components/HotelInfo';
import InputNumber from '../../components/InputNumber';

class Hotel extends Component {
    static propTypes = {
        children: PropTypes.node,
        city: PropTypes.shape({
            _id: PropTypes.string,
            name: PropTypes.string,
            bounds: PropTypes.shape({
                south: PropTypes.number, west: PropTypes.number,
                north: PropTypes.number, east: PropTypes.number}),
            timezone: PropTypes.string
        }),
        hotels: PropTypes.array,
        selectedHotel: PropTypes.string,
        selectedFlight: PropTypes.string,
        sorting: PropTypes.object,
        days: PropTypes.number,
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

        this.selectedHotel = props.hotels.find(el => el._id == props.selectedHotel);
        this.state = {
            hotels: this.sort(props.hotels, props.sorting.field, props.sorting.asc),
            hotelInfo: null
        };
        
        this.selectHotel = this._selectHotel.bind(this);
        this.handleHotelInfoClick = this._handleHotelInfoClick.bind(this);
        this.handleSortChange = this._handleSortChange.bind(this);
    }
    
    sort(hotels, field = this.props.sorting.field, asc = this.props.sorting.asc) {
        switch (field) {
            case 'price':
                return hotels.sort(Sorting.byObjectFields(
                    [{field, asc}, {field: 'stars', asc: false}, {field: 'popularity', asc: false}]
                ));
            case 'stars':
                return hotels.sort(Sorting.byObjectFields(
                    [{field, asc}, {field: 'popularity', asc: false}, {field: 'price'}]
                ));
            case 'popularity':
                return hotels.sort(Sorting.byObjectFields(
                    [{field, asc}, {field: 'stars', asc: false}, {field: 'price'}]
                ));
        }
    }

    _handleSortChange(field, asc) {
        let hotels = this.sort(this.state.hotels, field, asc);
        this.setState({hotels});
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
        let { date } = this.props;
        return (
            this.props.selectedFlight &&
            <div className="height-100">
                <div className="hotel-header">
                    <div className="inline">
                        <h3>{this.props.city.name}</h3>
                        <span>
                            Day 1-{this.props.days}&nbsp;
                            ({DateHelper.formatDateMonth(date)} - {DateHelper.formatDateMonth(DateHelper.addDays(date, this.props.days))})
                        </span>
                    </div>
                    <Button className="success float-right large continue-button" disabled={!this.selectedHotel} link="/car">
                        Continue
                    </Button>
                </div>
                <hr/>
                <div className="row hotels-search">
                    <div className="medium-7 columns map-wrap">
                        <TripMap city={this.props.city} hotels={this.props.hotels} selectedHotel={this.selectedHotel}
                                 onMarkerClick={this.selectHotel}/>
                    </div>
                    <div className="medium-5 columns">
                        {this.selectedHotel &&
                        <div>
                            <div>
                                <h4 className="inline">Current selection</h4>
                                <div className="inline days">
                                    <span>Days to stay:</span>
                                    <InputNumber className="inline" min={1} max={this.props.maxDays}
                                           value={this.props.days}
                                           onChange={num => this.props.actions.setHotelDays(num)} />
                                </div>
                            </div>
                            <HotelCard hotel={this.selectedHotel} className="selected"
                                       price={this.props.days * this.selectedHotel.price}
                                       onInfoClick={this.handleHotelInfoClick}/>
                            <hr className="selection-hr"/>
                        </div>}
                        <h4>{this.selectedHotel && 'Select another hotel' || 'Select hotel'}</h4>
                        <HotelsSort sorting={this.props.sorting} onSortChange={this.handleSortChange} />
                        <ul className={`hotels-list ${this.selectedHotel && 'selected' || ''}`}>
                        {this.state.hotels.map((hotel, index) =>
                            <HotelCard className={`${index == this.props.hotels.length - 1 && 'last' || ''}`}
                                       key={hotel._id} hotel={hotel} onClick={this.selectHotel}
                                       onInfoClick={this.handleHotelInfoClick}/>
                        )}
                        </ul>
                    </div>
                </div>
                <Modal closeButton className="large" show={!!this.state.hotelInfo} onClose={() => this.closeDialog()}>
                    <HotelInfo hotel={this.state.hotelInfo} onSelect={hotel => this.selectHotel(hotel, true)}/>
                </Modal>
            </div>
            ||
            <div className="height-100"><h2 className="subheader text-center">Flight not selected</h2></div>
        );
    }
}

function mapStateToProps(state) {
    let city = flightCity(state);
    return {
        city,
        hotels: city && state.hotel.hotels.filter(el => el.city._id == city._id) || [],
        selectedHotel: state.hotel.selectedHotel,
        selectedFlight: state.flight.selectedFlight,
        sorting: state.hotel.sorting,
        days: state.hotel.days,
        date: state.summary.date
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({selectHotel, setHotelsSort, setHotelDays}, dispatch)
    };
}

export default connect(
    mapStateToProps, mapDispatchToProps
)(Hotel);
