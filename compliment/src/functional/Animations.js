const appear = (compliment, options) => {
    let opacity =  parseFloat(window.getComputedStyle(compliment).getPropertyValue('opacity'));
    const id = setInterval(frame, 10);
    function frame () {
        if (opacity >= 1) {
            compliment.style.opacity = 1;
            if (options !== undefined && options.grow) grow(compliment);
            clearInterval(id);
        } else {
            opacity += 0.1;
            compliment.style.opacity = opacity;
        }
    }
}

const disappear = (compliment, options) => {
    // console.log('disappearing')
    let opacity =  parseFloat(window.getComputedStyle(compliment).getPropertyValue('opacity'));
    const id = setInterval(frame, 10);
    function frame () {
        if (opacity <= 0) {
            clearInterval(id);
        } else {
            opacity -= 0.05;
            compliment.style.opacity = opacity;
        }
    }
}

const grow = (compliment, options) => {
    // console.log('growing');
    compliment.style.width = '80%';
    compliment.style.height = '80%';
}

const shrink = (compliment, options) => {
    // console.log('shrinking');
    compliment.style.width = 0;
    compliment.style.height = 0;
    compliment.style.opacity = 0;
}

const animate = (animation, element, options) => {
    const compliment = document.getElementById(element);
    switch (animation)   {
        case 'appear':
            appear(compliment, options);
            break;
        case 'disappear':
            disappear(compliment, options);
            break;
        case 'grow':
            grow(compliment, options);
            break;
        case 'shrink':
            shrink(compliment, options);
            break;
        case 'none':
            break;
        default:
            console.log('Invalid animation. Try one of the following: appear, disappear, grow, shrink');
    }
}

module.exports = {

    animate,
    appear,
    disappear,
    grow,
    shrink

}