'use strict';

class SchematicMap {
    get COLOR_OK() {return "#41A906";};
    get COLOR_TOLERANCE() {return "#FFA807";};
    get COLOR_FAULT() {return "#FA0A10";};
    
    get NODE_TYPE_POWER() {return "power";};
    get NODE_TYPE_CONSUMPTION() {return "consumption";};
    get NODE_TYPE_TURBOGEN() {return "turbogen";};
    get NODE_TYPE_HYDROGEN() {return "hydrogen";};
    get NODE_TYPE_SUPSYS() {return "superiorSystem";};
    get SECTION_TYPE_LINE() {return "line";};
    get SECTION_TYPE_TRANS() {return "transformer";};
    get SECTION_TYPE_TRANSW3() {return "transformerW3";};
    get SECTION_TYPE_REACTOR() {return "reactor";};
    get SECTION_TYPE_SWITCH() {return "switch";};
    
    constructor() {
    }

    createNode(config) {
        var size = 10, shape = "circle", colorBack = "#ffffff", fontSize = 10, colorBorder = null, borderWidth = 2;
        if(config.id == null || config.x == null || config.y == null){
            return null;
        }
        
        switch(config.type){
            case this.NODE_TYPE_POWER:
                shape = "dot";
                colorBack = "#777777";
                colorBorder = (config.color != null) ? config.color : "#555555";
                break;
            case this.NODE_TYPE_CONSUMPTION:
                shape = "dot";
                colorBack = "#ffffff";
                colorBorder = (config.color != null) ? config.color : "#bbbbbb";
                break;
            case this.NODE_TYPE_TURBOGEN:
            case this.NODE_TYPE_HYDROGEN:
                fontSize = 20;
                shape = "circle";
                config.label = "G";
                colorBack = "#cccccc";
                colorBorder = (config.color != null) ? config.color : "#999999";
                break;
            case this.NODE_TYPE_SUPSYS:
                fontSize = 20;
                shape = "circle";
                config.label = "S";
                colorBack = "#cccccc";
                colorBorder = (config.color != null) ? config.color : "#999999";
                break;
            default:
                return null;
        }
        
        let node  = {
            id : "N_" + config.id,
            size : size,
            font : { size : fontSize },
            borderWidth: (config.color != null) ? 2 : borderWidth,
            color : {border:colorBorder, background:colorBack},
            shape : shape,
            x : config.x,
            y : config.y
        };
        if(config.label != null){
            node.label = config.label;
        }
        if(colorBorder != null){
            //node.color.border = colorBorder;
        }
        if(config.title != null){
            node.title = this.getNodeTooltip(config.title);
        }
        return node;
    }
    
    createSection(config) {
        var size = 5, colorDefault = "#999999", fontSize = 10, fontSizeTransEdgeLabel = 7;
        if(config.id == null || config.from == null || config.to == null){
            return null;
        }
        let r = {
            nodes : [],
            edges : []
        };
        
        switch(config.type){
            case this.SECTION_TYPE_LINE:
                let edge = {
                    id : "E_" + config.id,
                    from : config.from,
                    to : config.to,
                    color : (config.color != null) ? config.color : colorDefault,
                    font : {size : fontSize}
                };
                if(config.label != null){
                    edge.label = config.label;
                }
                if(config.title != null){
                    edge.title = this.getSectionTooltip(config.title);
                }
                r.edges.push(edge);
                break;
            case this.SECTION_TYPE_TRANS:
                if(config.x == null || config.y == null){
                    return null;
                }
                
                let nodeT  = {
                    id : "SN_T_" + config.id,
                    size : (size * 2),
                    font : {size : fontSize},
                    color : (config.color != null) ? config.color : colorDefault,
                    shape : "square",
                    x : config.x,
                    y : config.y
                };
                if(config.label != null){
                    nodeT.label = config.label;
                }
                if(config.title != null){
                    nodeT.title = this.getSectionTooltip(config.title);
                }
                r.nodes.push(nodeT);
                
                r.edges.push({
                    id : "SE_SRC_" + config.id,
                    from : config.from,
                    to : nodeT.id,
                    color : (config.color != null) ? config.color : colorDefault,
                    font : {size : fontSizeTransEdgeLabel},
                    label : "src",
                    dashes : true
                });
                r.edges.push({
                    id : "SE_DST_" + config.id,
                    from : nodeT.id,
                    to : config.to,
                    color : (config.color != null) ? config.color : colorDefault,
                    font : {size : fontSizeTransEdgeLabel},
                    label : "dst",
                    dashes : true
                });
                break;
            case this.SECTION_TYPE_TRANSW3:
                if(config.x == null || config.y == null || config.toTrc == null){
                    return null;
                }
                
                let nodeT3  = {
                    id : "SN_T3_" + config.id,
                    size : (size * 2),
                    font : {size : fontSize},
                    color : (config.color != null) ? config.color : colorDefault,
                    shape : "square",
                    x : config.x,
                    y : config.y
                };
                if(config.label != null){
                    nodeT3.label = config.label;
                }
                if(config.title != null){
                    nodeT3.title = this.getSectionTooltip(config.title);
                }
                r.nodes.push(nodeT3);
                
                r.edges.push({
                    id : "SE_DST_" + config.id,
                    from : config.from,
                    to : nodeT3.id,
                    color : (config.color != null) ? config.color : colorDefault,
                    font : {size : fontSizeTransEdgeLabel},
                    label : "dst",
                    dashes : true
                });
                r.edges.push({
                    id : "SE_SRC_" + config.id,
                    from : nodeT3.id,
                    to : config.to,
                    color : (config.color != null) ? config.color : colorDefault,
                    font : {size : fontSizeTransEdgeLabel},
                    label : "src",
                    dashes : true
                });
                r.edges.push({
                    id : "SE_TRC_" + config.id,
                    from : nodeT3.id,
                    to : config.toTrc,
                    color : (config.color != null) ? config.color : colorDefault,
                    font : {size : fontSizeTransEdgeLabel},
                    label : "trc",
                    dashes : true
                });
                break;
            case this.SECTION_TYPE_REACTOR:
                if(config.x == null || config.y == null){
                    return null;
                }
                
                let nodeR  = {
                    id : "SN_R_" + config.id,
                    size : size,
                    font : {size : fontSize},
                    color : (config.color != null) ? config.color : colorDefault,
                    shape : "triangle",
                    x : config.x,
                    y : config.y
                };
                if(config.label != null){
                    nodeR.label = config.label;
                }
                if(config.title != null){
                    nodeR.title = this.getSectionTooltip(config.title);
                }
                r.nodes.push(nodeR);
                
                r.edges.push({
                    id : "SE_F_" + config.id,
                    from : config.from,
                    to : nodeR.id,
                    color : (config.color != null) ? config.color : colorDefault
                });
                r.edges.push({
                    id : "SE_T_" + config.id,
                    from : nodeR.id,
                    to : config.to,
                    color : (config.color != null) ? config.color : colorDefault
                });
                break;
            case this.SECTION_TYPE_SWITCH:
                if(config.x == null || config.y == null){
                    return null;
                }
                
                let nodeS  = {
                    id : "SN_S_" + config.id,
                    size : size,
                    font : {size : fontSize},
                    color : (config.color != null) ? config.color : colorDefault,
                    shape : "diamond",
                    x : config.x,
                    y : config.y
                };
                if(config.label != null){
                    nodeS.label = config.label;
                }
                if(config.title != null){
                    nodeS.title = this.getSectionTooltip(config.title);
                }
                r.nodes.push(nodeS);
                
                r.edges.push({
                    id : "SE_F_" + config.id,
                    from : config.from,
                    to : nodeS.id,
                    color : (config.color != null) ? config.color : colorDefault
                });
                r.edges.push({
                    id : "SE_T_" + config.id,
                    from : nodeS.id,
                    to : config.to,
                    color : (config.color != null) ? config.color : colorDefault
                });
                break;
            default:
                return null;
        }
        
        return r;
    }
    
    getRectangleCenter(ax, ay, bx, by){
        let dx = 0, dy = 0;
        
        dx = Math.round((-1) * ((ax - bx)/2));
        dy = Math.round((-1) * ((ay - by)/2));
        
        return {
            x : ax + dx,
            y : ay + dy
        };
    }
    
    getNodeTooltip(config){
        let panelClass = (config.enabledColors) ? config.panelColor : "panel-default";
        return "<div class='panel "+ panelClass +"' style='margin-bottom:0px'>"+
            "<div class='panel-heading'>"+
                "<h3 class='panel-title'>" + config.label + " <small>[ID: " + config.id + "]</small></h3>"+
            "</div>"+
            "<div class='panel-body' style='height: 145px; padding-top: 0px; padding-bottom: 0px'>"+
                "<table class='table' style='border: none; margin-bottom:1px'>"+
                    "<tr>"+
                        "<td>spec.voltage.level</td>"+
                        "<td><strong>" + config.voltageSpec + "</strong>&nbsp;V</td>"+
                    "</tr>"+
                    "<tr>"+
                        "<td>calc.voltage.value</td>"+
                        "<td><strong>" + config.voltageCalc + "</strong>&nbsp;V</td>"+
                    "</tr>"+
                    "<tr>"+
                        "<td>|diff|</td>"+
                        "<td>" + Math.abs(config.voltageCalc - config.voltageSpec) + " V</td>"+
                    "</tr>"+
                "</table>"+
            "</div>"+
        "</div>";
    }
    
    getSectionTooltip(config){
        let panelClass = (config.enabledColors) ? config.panelColor : "panel-default";
        return "<div class='panel "+ panelClass +"' style='margin-bottom:0px'>"+
            "<div class='panel-heading'>"+
                "<h3 class='panel-title'>" + config.label + " <small>[ID: " + config.id + "]</small></h3>"+
            "</div>"+
            "<div class='panel-body' style='height: 145px; padding-top: 0px; padding-bottom: 0px'>"+
                "<table class='table' style='border: none; margin-bottom:1px'>"+
                    "<tr>"+
                        "<td>spec.current.max</td>"+
                        "<td><strong>" + config.currentMax + "</strong>&nbsp;A</td>"+
                    "</tr>"+
                    "<tr>"+
                        "<td>calc.current.src</td>"+
                        "<td><strong>" + config.currentSrc + "</strong>&nbsp;A</td>"+
                    "</tr>"+
                    "<tr>"+
                        "<td>calc.current.dst</td>"+
                        "<td><strong>" + config.currentDst + "</strong>&nbsp;A</td>"+
                    "</tr>"+
                    "<tr>"+
                        "<td>|diff(max,dst)|</td>"+
                        "<td>" + Math.abs(config.currentMax - config.currentDst) + " A</td>"+
                    "</tr>"+
                "</table>"+
            "</div>"+
        "</div>";
    }
}

export default angular.module('cpdnEditor.maps.services', [])
  .service('SchematicMap', SchematicMap)
  .name;
