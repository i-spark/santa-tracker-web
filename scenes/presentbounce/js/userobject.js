/*
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
'use strict'

goog.provide('app.UserObject');

goog.require('b2');
goog.require('app.Unit');
  

  
/**
 * Abtract Base Class - UserObject class
 * Add user controls such as drag / rotation to object
 */
class UserObject extends LevelObject {
  
  /**
   * @constructor
   * @override
   */
  constructor() {
    super(...arguments);
    this.wasDragged = false;
    this.mouseJoint_ = null;
    
    this.onDragStart_ = this.onDragStart_.bind(this);
    this.onDragMove_ = this.onDragMove_.bind(this);
    this.onDragEnd_ = this.onDragEnd_.bind(this);
    
    this.addEventListeners_();
    this.buildReferenceBody_();
  }

  /**
   * @protected
   */
  onTapEnd() {
    // override in subclass
  }

  /**
   * @protected
   */
  onDragEnd() {
    // override in subclass
  }

  /**
   * @private
   */
  addEventListeners_() {
    this.el_.addEventListener('mousedown', this.onDragStart_);
  }

  /**
   * @private
   */
  removeEventListeners_() {
    this.el_.removeEventListener('mousedown', this.onDragStart_);
    document.removeEventListener('mouseup', this.onDragEnd_);
    document.removeEventListener('mousemove', this.onDragMove_);
  }

  /**
   * Hidden ground body used as reference point for MouseJoint
   * @private
   */
  buildReferenceBody_() {
    // OPTIMIZE this body could be shared between all user objects
    const bodyDef = new b2.BodyDef();
    bodyDef.type = b2.Body.b2_staticBody;
    bodyDef.position.Set(0, 0); // place outside of canvas
    this.ground_ = this.world_.CreateBody( bodyDef );
  }

  onDragStart_(e) {
    if (!this.mouseJoint_) {
      document.addEventListener('mouseup', this.onDragEnd_);
      document.addEventListener('mousemove', this.onDragMove_);
      
      this.body_.SetAwake(false);
      // change type to dynamic so it can be moved
      this.body_.SetType( b2.Body.b2_dynamicBody );
      // lock rotation so it's not affected by gravity
      this.body_.SetFixedRotation(true);
      
      // create mouse joint
      const def = new b2.MouseJointDef();
      def.bodyA = this.ground_;
      def.bodyB = this.body_;
      def.target = new b2.Vec2(Unit.toWorld(e.clientX), Unit.toWorld(e.clientY))

      def.collideConnected = false; // no need to collide with fake ground object
      def.maxForce = 10000 * this.body_.GetMass();
      def.dampingRatio = 0.3;
      
      this.mouseJoint_ = this.world_.CreateJoint(def);
      this.body_.SetAwake(true);
    }
  }

  onDragMove_(e) {
    if (this.mouseJoint_) {
      this.wasDragged = true;
      this.mouseJoint_.SetTarget( new b2.Vec2(Unit.toWorld(e.clientX), Unit.toWorld(e.clientY)) );
    }
  }

  onDragEnd_(e) {
    document.removeEventListener('mouseup', this.onDragEnd_);
    document.removeEventListener('mousemove', this.onDragMove_);
    
    this.body_.SetType( b2.Body.b2_staticBody );
    this.body_.SetFixedRotation(false);
    if (this.mouseJoint_) {
      this.world_.DestroyJoint(this.mouseJoint_);
      this.mouseJoint_ = null;
    }
    
    if (this.wasDragged) {
      this.wasDragged = false
      this.onDragEnd();
    }
    else {
      this.onTapEnd();
    }  
  }

  destroy() {
    this.removeEventListeners_();
    super.destroy();
  }
}

app.UserObject = UserObject;
