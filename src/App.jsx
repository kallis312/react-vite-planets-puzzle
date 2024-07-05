import React, { useState, useEffect, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './App.scss';

const ItemTypes = {
  PLANET: 'planet',
};

const planetsData = [
  { name: 'venus', image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/217233/pq_venus.png', check: false, sort: 2 },
  { name: 'earth', image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/217233/pq_earth.png', check: false, sort: 3 },
  { name: 'saturn', image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/217233/pq_saturn.png', check: false, sort: 6 },
  { name: 'neptune', image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/217233/pq_neptune.png', check: false, sort: 8 },
  { name: 'mercury', image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/217233/pq_mercury.png', check: false, sort: 1 },
  { name: 'mars', image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/217233/pq_mars.png', check: false, sort: 4 },
  { name: 'jupiter', image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/217233/pq_jupiter.png', check: false, sort: 5 },
  { name: 'uranus', image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/217233/pq_uranus.png', check: false, sort: 7 },
];

const Planet = ({ planet }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.PLANET,
    item: { name: planet.name },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });
  return (
    <div className="planet_wrap" ref={drag}>
      <div className={`planet ${isDragging ? 'isDrag' : planet.check ? 'check' : ''}`} data-planet={planet.name} >
        <img src={planet.image} alt={planet.name} />
        <span>{planet.name.charAt(0).toUpperCase() + planet.name.slice(1)}</span>
      </div>
      {
        planet.check && <div className="tick"><i className="icon ion-checkmark-round"></i></div>
      }
    </div>
  );
};

const PlanetHolder = ({ planet, onDrop }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.PLANET,
    drop: (item) => {
      if (!planet.check)
        onDrop(item.name, planet.name)
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });



  return (
    <div className={`planet_holder ${planet.name} ${planet.check ? 'planet_holder_answer' : ''}`} ref={drop} data-planet={planet.name} >
      <span>?</span>
      <div className="planet_answer">
        <img
          src={`https://s3-us-west-2.amazonaws.com/s.cdpn.io/217233/pq_${planet.name}.png`}
          alt={planet}
          className={planet.check ? 'scale' : ''}
        />
      </div>
    </div>
  );
};

const App = () => {
  const [planets, setPlanets] = useState([...planetsData])
  const [time, setTime] = useState('0 seconds');
  const correctCount = useRef(0)
  const timer = useRef(undefined)
  const [showModal, setShowModal] = useState('intro');

  const startTimer = () => {
    const startTime = new Date();
    timer.current = setInterval(() => {
      const currentTime = new Date();
      setTime(`${Math.floor((currentTime.getTime() - startTime.getTime()) / 1000)} seconds`);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timer.current);
    timer.current = undefined
  };

  const handleDrop = (droppedPlanet, planet) => {
    if (droppedPlanet === planet) {
      correctCount.current += 1;
      setPlanets(prevPlanets => {
        const index = planets.findIndex(pln => planet === pln.name)
        console.log(index);
        if (index > -1) {
          const newPlanets = [...prevPlanets];
          newPlanets[index].check = true;
          return newPlanets;
        }
        return prevPlanets
      })
      document.querySelector(`.planet[data-planet=${droppedPlanet}]`).classList.add('answered');
      if (correctCount.current === planets.length) {
        setShowModal('winner');
        stopTimer();
      }
    }
  };

  const startGame = () => {
    startTimer();
    stopTimer();
    setShowModal(null);
  }

  const resetGame = () => {
    correctCount.current = 0;
    setPlanets(planetsData.map(item => ({ ...item, check: false })))
    setTime('0 seconds');
    setShowModal('intro');
    startTimer();
    document.querySelectorAll('.planet').forEach(Elem => {
      Elem.classList.remove(['answered']);
    })
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        {!showModal && (
          <div className="timer">{time}</div>
        )}

        {showModal === 'intro' && (
          <div className='overlay'>
            <div className="modal">
              <div className="modal_inner">
                <div className="modal_inner__close c_modal st" onClick={() => setShowModal(null)}>
                  x
                </div>
                <div className="modal_inner__title">
                  <h2>Planet quiz</h2>
                </div>
                <div className="modal_inner__text">
                  <p>Drag the planets in the correct order as fast as you can!</p>
                </div>
                <div className="modal_inner__image">
                  <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/217233/sdfsdfsdf.gif" alt="Intro" />
                </div>
                <div className="modal_inner__cta c_modal">
                  <button className="st" onClick={startGame}>
                    Lets go!
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


        {showModal === 'winner' && (

          <div className='overlay'>
            <div className="modal">
              <div className="modal_inner">
                <div className="modal_inner__title">
                  <h2>
                    Well done, you won in <span className="t">10.00</span>
                  </h2>
                </div>
                <div className="modal_inner__text">
                  <p>You are a proper clever cloggs! Why not share this with a friend and see if they are as smart as you!</p>
                </div>
                <div className="modal_inner__cta">
                  <button className="cp">
                    <a href="https://www.codepen.io/jcoulterdesign" target="_blank" rel="noopener noreferrer">
                      Follow me on Codepen
                    </a>
                  </button>
                  <button className="tw">Tweet</button>
                  <button className="fb">Share on facebook</button>
                </div>
                <div className="modal_inner__restart">
                  <button className="ta" onClick={resetGame}>
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="planets">
          <div className="planets_stars"></div>
          <div className="planets_container">
            <div className="planets_container__title">
              <h1>Planets quiz</h1>
            </div>
            <div className="planets_container__title">
              <h3>Drag the planets into the correct order</h3>
            </div>
            <div className="planets_container__planets">
              {[...planets].map((planet, index) => (
                <Planet key={index} planet={planet} />
              ))}
            </div>
            <div className="planets_container__quiz">
              <div className="planet_holder sun null" data-planet="sun">
                <span>?</span>
                <div className="planet_answer">
                  <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/217233/pq_sun.png" alt='' />
                </div>
              </div>
              {[...planets].sort((a, b) => a.sort - b.sort).map((planet, index) => (
                <PlanetHolder key={index} planet={planet} onDrop={handleDrop} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default App