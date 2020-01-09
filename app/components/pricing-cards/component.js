import Component from '@ember/component';
import $ from 'jquery';

export default Component.extend({

  mouseEnterHandler(){
    $('.card-focussed').removeClass('card-focussed');
    $(this).addClass('card-focussed');
  },

  mouseLeaveHandler(){
    $(this).removeClass('card-focussed');
    $('#default-up').addClass('card-focussed');
  },

  attachCardHoverListener(){
    $('.box').off('mouseenter',this.mouseEnterHandler).on('mouseenter',this.mouseEnterHandler);
    $('.box').off('mouseleave',this.mouseLeaveHandler).on('mouseleave',this.mouseLeaveHandler);
  },


  didInsertElement(){
    this.attachCardHoverListener();
    const midBOx = $('.box').get(1);
    $(midBOx).addClass('card-focussed').attr('id','default-up');
  }
});
