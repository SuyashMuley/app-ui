import createEngine, {
  DiagramModel,
  DefaultNodeModel,
  DefaultLinkModel,
  DefaultLinkFactory,
  DefaultPortModel,
  PointModel,
  DefaultLinkWidget,
  LinkWidget,
} from "@projectstorm/react-diagrams";
import * as React from "react";
import { CanvasWidget } from "@projectstorm/react-canvas-core";
import { DemoCanvasWidget } from "./DemoCanvasWidget";
import { MouseEvent } from "react";


export class AdvancedLinkModel extends DefaultLinkModel {
  constructor() {
    super({
      type: "advanced",
      width: 4,
    });
  }
}

export class AdvancedPortModel extends DefaultPortModel {
  createLinkModel() {
    return new AdvancedLinkModel();
  }
}

const CustomLinkArrowWidget = (props: {
  color?: any;
  point?: any;
  previousPoint?: any;
}) => {
  const { point, previousPoint } = props;

  const angle =
    90 +
    (Math.atan2(
      point.getPosition().y - previousPoint.getPosition().y,
      point.getPosition().x - previousPoint.getPosition().x
    ) *
      180) /
      Math.PI;

  return (
    <g
      className="arrow"
      transform={
        "translate(" +
        point.getPosition().x +
        ", " +
        point.getPosition().y +
        ")"
      }
    >
      <g style={{ transform: "rotate(" + angle + "deg)" }}>
        <g transform={"translate(0, -3)"}>
          <polygon
            points="0,10 8,30 -8,30"
            fill={props.color}
            data-id={point.getID()}
            data-linkid={point.getLink().getID()}
          />
        </g>
      </g>
    </g>
  );
};

export class AdvancedLinkWidget extends DefaultLinkWidget {
  generateArrow(point: PointModel, previousPoint: PointModel): JSX.Element {
    return (
      <CustomLinkArrowWidget
        key={point.getID()}
        point={point as any}
        previousPoint={previousPoint as any}
        color={this.props.link.getOptions().color}
      />
    );
  }

  render() {
    var points = this.props.link.getPoints();
    var paths = [];
    this.refPaths = [];

    for (let j = 0; j < points.length - 1; j++) {
      paths.push(
        this.generateLink(
          LinkWidget.generateLinePath(points[j], points[j + 1]),
          {
            "data-linkid": this.props.link.getID(),
            "data-point": j,
            onMouseDown: (event: MouseEvent) => {
              this.addPointToLink(event, j + 1);
            },
          },
          j
        )
      );
    }

    for (let i = 1; i < points.length - 1; i++) {
      paths.push(this.generatePoint(points[i]));
    }

    if (this.props.link.getTargetPort() !== null) {
      paths.push(
        this.generateArrow(points[points.length - 1], points[points.length - 2])
      );
    } else {
      paths.push(this.generatePoint(points[points.length - 1]));
    }

    return (
      <g data-default-link-test={this.props.link.getOptions().testName}>
        {paths}
      </g>
    );
  }
}
export class AdvancedLinkFactory extends DefaultLinkFactory {
  constructor() {
    super("advanced");
  }

  generateModel(): AdvancedLinkModel {
    return new AdvancedLinkModel();
  }

  generateReactWidget(event: { model: DefaultLinkModel }): JSX.Element {
    return (
      <AdvancedLinkWidget link={event.model} diagramEngine={this.engine} />
    );
  }
}

const Connection = () => {
  var engine = createEngine();
  engine.getLinkFactories().registerFactory(new AdvancedLinkFactory());
  var node1 = new DefaultNodeModel("Source", "rgb(0,192,255)");
  let port1 = node1.addPort(new AdvancedPortModel(false, "out"));
  node1.setPosition(600, 400);
  node1.registerListener({
    positionChanged: (e: any) => {
      console.log(e);
      fetch("http://localhost:5000/api/state/cache", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: JSON.stringify(e.entity.position),
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {});
    },
  });
  var node2 = new DefaultNodeModel("Destination", "rgb(192,255,0)");
  var port2 = node2.addPort(new AdvancedPortModel(true, "in"));
  node2.setPosition(1200, 400);
  node2.registerListener({
    positionChanged: (e: any) => {
      console.log(e);
      fetch("http://localhost:5000/api/state/cache", {
        method: 'POST',
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: JSON.stringify(e.entity.position),
      })
      .then(function(response){
        return response.json();
      })
      .then(function(data) {});
    },
  });
  var model = new DiagramModel();

  model.addAll(port1.link(port2));
  model.addAll(node1, node2);
  engine.setModel(model);
  // engine.setModel(model);
  return (
    <DemoCanvasWidget>
      <CanvasWidget engine={engine} />
    </DemoCanvasWidget>
  );
};

export default Connection;

