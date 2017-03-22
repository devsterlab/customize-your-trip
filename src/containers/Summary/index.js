import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import history from '../../util/history';
import * as actions from '../../actions/summary';
import DateHelper from '../../util/dateHelper';

import Timeline from '../../components/Timeline';
import Category from '../../components/Timeline/Category';
import Title from '../../components/Timeline/Title';
import Item from '../../components/Timeline/Item';
import Content from '../../components/Timeline/Content';
import Actions from '../../components/Timeline/Actions';

import FlightCard from '../../components/FlightCard';
import HotelCard from '../../components/HotelCard';
import CarCard from '../../components/CarCard';
import Button from '../../components/Button';
import RemoveItemModal from './RemoveItemModal';

class Summary extends Component {
    static propTypes = {
        actions: PropTypes.shape({
            setCurrentStep: PropTypes.func,
            continueTrip: PropTypes.func,
            editItem: PropTypes.func,
            removeItem: PropTypes.func
        }),
        children: PropTypes.node,
        cities: PropTypes.object,
        flights: PropTypes.object,
        hotels: PropTypes.object,
        cars: PropTypes.object,
        steps: PropTypes.arrayOf(PropTypes.shape({
            flight: PropTypes.string,
            hotel: PropTypes.string,
            car: PropTypes.string,
            hotelDays: PropTypes.number,
            carDays: PropTypes.number,
            date: PropTypes.object,
            dateFrom: PropTypes.object,
            dateTo: PropTypes.object,
            days: PropTypes.number,
            price: PropTypes.number
        })),
        homeCity: PropTypes.string,
        days: PropTypes.number,
        price: PropTypes.number,
        currentStep: PropTypes.object,
        index: PropTypes.number
    };

    constructor(props) {
        super(props);

        this.state = {steps: props.steps};
    }

    componentWillMount() {
        this.props.actions.setCurrentStep();
    }

    componentWillReceiveProps(props) {
        this.setState({
            steps: props.currentStep && props.steps
                .slice(0, props.index)
                .concat([props.currentStep])
                .concat(props.steps.slice(props.index, props.steps.length))
            || props.steps
        });
    }

    shouldComponentUpdate(props, state) {
        return props.steps != this.props.steps
            || state.steps != this.state.steps
            || state.removeData != this.state.removeData;
    }

    handleContinueClick() {
        this.props.actions.continueTrip();
    }

    editItem(step, index, itemType) {
        this.props.actions.editItem(step, index, itemType);
        history.push(`/${itemType}`);
    }

    removeItem() {
        let {step, index, itemType} = this.state.removeData;
        this.props.actions.removeItem(step, index, itemType);
        this.closeRemoveModal();
    }

    handleRemoveItem(step, index, itemType) {
        this.setState({removeData: {step, index, itemType}});
    }

    getModalData() {
        if (!this.state.removeData) return;

        let step = this.state.removeData.step;
        return Object.assign({}, this.state.removeData, {
            step: Object.assign({}, step, {
                flight: this.props.flights[step.flight],
                hotel: this.props.hotels[step.hotel],
                car: this.props.cars[step.car]
            })
        });
    }

    closeRemoveModal() {
        this.setState({removeData: null});
    }

    render() {
        let {homeCity, days, price, flights, hotels, cars} = this.props;
        let steps = this.state.steps;
        const summaryAvailable = steps.length;
        if (summaryAvailable) {
            var firstStep = steps[0], lastStep = steps[steps.length - 1];
            var tripFinished = flights[lastStep.flight].toCity._id == homeCity && !lastStep.hotel;
            var finishSecondary = `${DateHelper.formatDateMonth(firstStep.date)} - `
                + `${DateHelper.formatDateMonth(lastStep.dateTo)}`
                + ` | ${DateHelper.formatDays(days || 0)}`;
        }

        return (
            summaryAvailable &&
            <div className={`summary row height-100 ${tripFinished && 'finish' || ''}`}>
                <h3 className="header">
                    Your <strong>trip summary</strong> looks great!
                </h3>
                {!tripFinished &&
                <Button
                    className="success float-right large continue-button"
                    link="/flight"
                    onClick={() => this.handleContinueClick()}
                >
                    Continue
                </Button>}

                <hr className="divider"/>

                <Timeline>
                    {steps.map((step, index) => {
                        const flight = flights[step.flight], hotel = hotels[step.hotel], car = cars[step.car];
                        const isFirstStep = index == 0, isLastStep = index == steps.length - 1,
                            secondary = `${DateHelper.formatDateMonth(step.dateFrom)} - `
                                + `${DateHelper.formatDateMonth(step.dateTo)} | ${DateHelper.formatDays(step.days)}`,
                            isHome = flight.toCity._id == homeCity;
                        const isFinish = isHome && !hotel;
                        if (!isLastStep) {
                            var nextStep = steps[index + 1];
                            var nextStepFlight = flights[nextStep.flight];
                        }
                        return (
                            <div key={index}>
                                {isFirstStep &&
                                <Category>
                                    <Title date={step.date} icon="mdi-home">{flight.fromCity.name}</Title>
                                    <Item icon="mdi-airplane" className="last">
                                        <Content>
                                            <FlightCard flight={flight} date={step.date}/>
                                        </Content>
                                        <Actions
                                            onEdit={() => this.editItem(step, index, 'flight')}
                                            onRemove={() => this.handleRemoveItem(step, index, 'flight')}
                                        />
                                    </Item>
                                </Category>}

                                <Category className={isFinish && 'last' || ''}>
                                    <Title
                                        date={isFinish && step.dateTo || step.dateFrom}
                                        icon={isHome && 'mdi-home' || 'mdi-city'}
                                        secondary={isFinish && finishSecondary || secondary}
                                    >
                                        {isFinish &&
                                        <span>Trip end:&nbsp;
                                            <strong>${price || 0}</strong>
                                        </span> ||
                                        flight.toCity.name}
                                    </Title>

                                    {!isFinish && <div>
                                        <Item icon="mdi-hotel" className={(!car && isLastStep) && 'last' || ''}>
                                            <Content>
                                                <HotelCard
                                                    hotel={hotel}
                                                    price={hotel.price}
                                                    days={step.hotelDays}
                                                    spinnerParent=".timeline"
                                                />
                                            </Content>
                                            <Actions
                                                onEdit={() => this.editItem(step, index, 'hotel')}
                                                onRemove={() => this.handleRemoveItem(step, index, 'hotel')}
                                            />
                                        </Item>
                                        {car && <Item icon="mdi-car" className={isLastStep && 'last' || ''}>
                                            <Content>
                                                <CarCard
                                                    car={car}
                                                    price={car.price}
                                                    days={step.carDays}
                                                    spinnerParent=".timeline"
                                                />
                                            </Content>
                                            <Actions
                                                onEdit={() => this.editItem(step, index, 'car')}
                                                onRemove={() => this.handleRemoveItem(step, index, 'car')}
                                            />
                                        </Item>}
                                        {!isLastStep &&
                                        <Item icon="mdi-airplane" className="last">
                                            <Content>
                                                <FlightCard flight={nextStepFlight} date={nextStep.date}/>
                                            </Content>
                                            <Actions
                                                onEdit={() => this.editItem(nextStep, index + 1, 'flight')}
                                                onRemove={() => this.handleRemoveItem(nextStep, index + 1, 'flight')}
                                            />
                                        </Item> || ''}
                                    </div>}
                                </Category>
                            </div>
                        );
                    })}

                    {!tripFinished &&
                    <Category className="last">
                        <Title date={lastStep.dateTo} icon="mdi-flag-checkered" secondary={finishSecondary}>
                            Trip end:&nbsp;
                            <strong>${price || 0}</strong>
                        </Title>
                    </Category>}
                </Timeline>

                <RemoveItemModal
                    removeData={this.getModalData()}
                    onRemove={() => this.removeItem()}
                    onClose={() => this.closeRemoveModal()}
                />
            </div> ||
            <div className="height-100">
                <h2 className="subheader text-center">Flight or hotel not selected</h2>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return Object.assign({}, state.summary, {
        cities: state.city.cities,
        flights: state.flight.flights,
        hotels: state.hotel.hotels,
        cars: state.car.cars
    });
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

export default connect(
    mapStateToProps, mapDispatchToProps
)(Summary);