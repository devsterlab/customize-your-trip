import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { continueTrip, setCurrentStep } from '../../actions/summary';
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

class Summary extends Component {
    static propTypes = {
        children: PropTypes.node,
        steps: PropTypes.arrayOf(PropTypes.shape({
            flight: PropTypes.shape({
                id: PropTypes.string,
                fromCity: PropTypes.shape({
                    id: PropTypes.string,
                    name: PropTypes.string,
                    timezone: PropTypes.number
                }),
                toCity: PropTypes.shape({
                    id: PropTypes.string,
                    name: PropTypes.string,
                    timezone: PropTypes.number
                }),
                companyName: PropTypes.string,
                available: PropTypes.number,
                price: PropTypes.number,
                departTime: PropTypes.string,
                duration: PropTypes.string
            }),
            hotel: PropTypes.shape({
                id: PropTypes.string,
                city: PropTypes.shape({
                    id: PropTypes.string,
                    name: PropTypes.string
                }),
                name: PropTypes.string,
                popularity: PropTypes.number,
                images: PropTypes.arrayOf(PropTypes.string),
                stars: PropTypes.number,
                latitude: PropTypes.number,
                longitude: PropTypes.number,
                address: PropTypes.string,
                description: PropTypes.string,
                price: PropTypes.number
            }),
            car: PropTypes.shape({
                id: PropTypes.string,
                city: PropTypes.shape({
                    id: PropTypes.string,
                    name: PropTypes.string
                }),
                brand: PropTypes.string,
                model: PropTypes.string,
                image: PropTypes.string,
                carType: PropTypes.string,
                price: PropTypes.number,
                transmission: PropTypes.oneOf(['manual', 'automatic']),
                maxPassengers: PropTypes.number
            }),
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
        currentStep: PropTypes.object
    };

    constructor(props) {
        super(props);

        this.currentStepConcated = false;
        this.state = { steps: props.steps };
        props.actions.setCurrentStep();
    }

    componentWillReceiveProps(props) {
        if (!this.currentStepConcated && props.currentStep) {
            this.currentStepConcated = true;
            this.setState({steps: this.state.steps.concat([props.currentStep])});
        }
    }

    handleContinueClick() {
        this.props.actions.continueTrip();
    }

    render() {
        let { homeCity, days, price, currentStep } = this.props;
        let steps = this.state.steps;
        const summaryAvailable = steps.length;
        if (summaryAvailable) {
            var firstStep = steps[0], lastStep = steps[steps.length - 1];
            var tripFinished = lastStep.flight.toCity.id == homeCity && !lastStep.hotel;
            var finishSecondary = `${DateHelper.formatDateMonth(firstStep.date)} - `
                + `${DateHelper.formatDateMonth(lastStep.dateTo)}`
                + ` | ${DateHelper.formatDays(days + (currentStep && currentStep.days || 0))}`;
        }

        return (
            summaryAvailable &&
            <div className="summary row height-100">
                <h3 className={`header ${tripFinished && 'finish' || ''}`}>
                    Your <strong>trip summary</strong> looks great!
                </h3>
                {!tripFinished && <Button className="success float-right large continue-button" link="/flight"
                        onClick={() => this.handleContinueClick()}>
                    Continue
                </Button>}
                <hr className="divider"/>
                <Timeline>
                    {steps.map((step, index) => {
                        const isFirstStep = index == 0, isLastStep = index == steps.length - 1,
                            secondary = `${DateHelper.formatDateMonth(step.dateFrom)} - `
                                + `${DateHelper.formatDateMonth(step.dateTo)} | ${DateHelper.formatDays(step.days)}`,
                            isHome = step.flight.toCity.id == homeCity;
                        const isFinish = isHome && !step.hotel;
                        if (!isLastStep) var nextStep = steps[index + 1];
                        return (
                            <div key={index}>
                                {isFirstStep && <Category>
                                    <Title date={step.date} icon="mdi-home">{step.flight.fromCity.name}</Title>
                                    <Item icon="mdi-airplane" className="last">
                                        <Content>
                                            <FlightCard flight={step.flight} date={step.date}/>
                                        </Content>
                                        <Actions></Actions>
                                    </Item>
                                </Category>}
                                <Category className={isFinish && 'last' || ''}>
                                    <Title date={isFinish && step.dateTo || step.dateFrom} icon={isHome && 'mdi-home' || 'mdi-city'}
                                           secondary={isFinish && finishSecondary || secondary}>
                                        {isFinish &&
                                        <span>Trip end:&nbsp;
                                            <strong>${price + (currentStep && currentStep.price || 0)}</strong>
                                        </span> ||
                                        step.flight.toCity.name}
                                    </Title>
                                    {!isFinish && <div>
                                        <Item icon="mdi-hotel" className={(!step.car && isLastStep) && 'last' || ''}>
                                            <Content>
                                                <HotelCard hotel={step.hotel} price={step.hotel.price} days={step.hotelDays}/>
                                            </Content>
                                            <Actions></Actions>
                                        </Item>
                                        {step.car && <Item icon="mdi-car" className={isLastStep && 'last' || ''}>
                                            <Content>
                                                <CarCard car={step.car} price={step.car.price} days={step.carDays}/>
                                            </Content>
                                            <Actions></Actions>
                                        </Item>}
                                        {!isLastStep && <Item icon="mdi-airplane" className="last">
                                            <Content>
                                                <FlightCard flight={nextStep.flight} date={nextStep.date}/>
                                            </Content>
                                            <Actions></Actions>
                                        </Item> || ''}
                                    </div>}
                                </Category>
                            </div>
                        );
                    })}
                    {!tripFinished && <Category className="last">
                        <Title date={lastStep.dateTo} icon="mdi-flag-checkered" secondary={finishSecondary}>
                            Trip end:&nbsp;
                            <strong>${price + (currentStep && currentStep.price || 0)}</strong>
                        </Title>
                    </Category>}
                </Timeline>
            </div> ||
            <div className="height-100">
                <h2 className="subheader text-center">Flight or hotel not selected</h2>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return state.summary;
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({ continueTrip, setCurrentStep }, dispatch)
    };
}

export default connect(
    mapStateToProps, mapDispatchToProps
)(Summary);