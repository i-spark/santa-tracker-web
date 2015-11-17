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

goog.provide('app.Spring');

goog.require('b2');
goog.require('app.Unit');
  


/**
 * Spring class
 * A very vouncy surface
 */
class Spring extends UserObject {  
  
  /**
   * @inheritDoc 
   */
  buildBody() {
    const bodyDef = new b2.BodyDef();
    bodyDef.type = b2.Body.b2_staticBody;
    bodyDef.position.Set(this.initialWorldPos_.x, this.initialWorldPos_.y);
    bodyDef.angle = this.config_.rotation * Math.PI / 180;
    
    const fixDef = new b2.FixtureDef();
    const {width, height} = this.config_.style;
    fixDef.density = this.config_.material.density;
    fixDef.friction = this.config_.material.friction;
    fixDef.restitution = this.config_.material.restitution;
    fixDef.shape = new b2.PolygonShape();
    fixDef.shape.SetAsBox( app.Unit.toWorld(width/2), app.Unit.toWorld(height/2) );
 
    const body = this.world_.CreateBody(bodyDef);
    body.CreateFixture(fixDef);
    return body;
  }
}

app.Spring = Spring;
