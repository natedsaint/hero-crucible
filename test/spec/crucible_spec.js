var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

describe('Crucible library', function () {
  'use strict';
  var Crucible; 

  beforeEach(function() {
    Crucible = require('../../crucible.js');
  });

  it('exists and exports a pour function', function () {
    var test_crucible = new Crucible();
    test_crucible.pour.should.be.a('function');
  });


});

