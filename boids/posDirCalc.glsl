precision lowp float;



uniform sampler2D boids;
uniform vec2 srcDimensions;
uniform vec2 pointerPos;
uniform float separation;
uniform float alignment;
uniform float cohesion;
uniform float stubbornness;
uniform float pointerAttraction;
uniform float maxNeighborDistance;
uniform float maxCloseness;
const int MAX_BOIDS = 10000;

#define FLOAT_MAX  1.70141184e38
#define FLOAT_MIN  1.17549435e-38
lowp vec4 encode_float(highp float v) {
    highp float av = abs(v);
    
    //Handle special cases
    if(av < FLOAT_MIN) {
        return vec4(0.0, 0.0, 0.0, 0.0);
    } else if(v > FLOAT_MAX) {
        return vec4(127.0, 128.0, 0.0, 0.0) / 255.0;
    } else if(v < -FLOAT_MAX) {
        return vec4(255.0, 128.0, 0.0, 0.0) / 255.0;
    }
    
    highp vec4 c = vec4(0,0,0,0);
    
    //Compute exponent and mantissa
    highp float e = floor(log2(av));
    highp float m = av * pow(2.0, -e) - 1.0;
    
    //Unpack mantissa
    c[1] = floor(128.0 * m);
    m -= c[1] / 128.0;
    c[2] = floor(32768.0 * m);
    m -= c[2] / 32768.0;
    c[3] = floor(8388608.0 * m);
    
    //Unpack exponent
    highp float ebias = e + 127.0;
    c[0] = floor(ebias / 2.0);
    ebias -= c[0] * 2.0;
    c[1] += floor(ebias) * 128.0; 
    
    //Unpack sign bit
    c[0] += 128.0 * step(0.0, -v);
    
    //Scale back to range
    return c / 255.0;
}
float getXorY(vec2 vec, bool x) {
    return x ? vec.x : vec.y;
}
void main() {

    bool x;
    
    vec2 myCoord = gl_FragCoord.xy / srcDimensions;
    x = int(myCoord.x) == 0;
    vec4 myData = texture2D(boids, vec2(0.5, myCoord.y));
    vec2 myPos = myData.xy;
    vec2 myDir = myData.zw;
    vec2 sumOfPositions = vec2(0.0, 0.0);
    float sumOfDirections = 0.0;
    float sumOfRepulsiveForces = 0.0;
    int neighborCt = 0;
    
    //Find the neighbors
    int boidCt = int(srcDimensions.y);
    for (int i = 0; i<MAX_BOIDS; i++) {
        if (i>boidCt) {break;}
        // if (neighborCt>5) {break;}
        if (i != int(gl_FragCoord.y)) {
            vec4 neighborData = texture2D(boids, vec2(0.5, (float(i)+.5) / srcDimensions.y));
            vec2 neighborPos = neighborData.xy;
            vec2 neighborDir = neighborData.zw;
            float dist = distance(myPos, neighborPos);
            if (dist < maxNeighborDistance && dist > 0.0) {
                sumOfPositions += neighborPos;
                sumOfDirections += getXorY(neighborDir, x);
                neighborCt++;
                if (dist < maxCloseness) {
                    sumOfRepulsiveForces += maxCloseness*getXorY(normalize(myPos - neighborPos), x)/dist;
                }
            }
        }
    }

    float value = 0.0;
    if (pointerPos.x >= 0.0 && pointerPos.y >= 0.0) {
        value += getXorY(normalize(pointerPos - myPos), x)*pointerAttraction;
        float dist = distance(myPos, pointerPos);
        value += 20.0*maxCloseness*separation*(getXorY(normalize(myPos - pointerPos), x)/dist);
    }
    float nCt = float(neighborCt);
    sumOfPositions /= nCt;
    sumOfDirections /= nCt;
    // sumOfRepulsiveForces /= nCt;
    if (nCt > 0.0) {
        if (cohesion > 0.0) {
            value += getXorY(normalize(sumOfPositions-myPos)*cohesion, x);
        }
        if (alignment > 0.0) {
            value += sumOfDirections*alignment;
        }
        if (separation > 0.0) {
            value += sumOfRepulsiveForces*separation;
        }
    }
    if (stubbornness > 0.0) {
        value += getXorY(myDir, x)*stubbornness;
    }
    // value = getXorY(myDir, x)*stubbornness;
    gl_FragColor = encode_float(value).abgr;
    // gl_FragColor = encode_float(getXorY(vec2(maxNeighborDistance, maxCloseness), x)).abgr;
}