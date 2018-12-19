uniform float u_time;
uniform vec2 u_resolution;

uniform sampler2D u_tex0;
uniform vec2 u_tex0Resolution;

uniform sampler2D u_tex1;
uniform vec2 u_tex1Resolution;

in vec2 v_texcoord;
varying out vec4 color_out;

float rand(vec2 n)
{
    return fract(sin(cos(dot(n, vec2(12.9898,12.1414)))) * 83758.5453);
}

float noise(vec2 n)
{
    const vec2 d = vec2(0.0, 1.0);
    vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
    return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}

float fbm(vec2 n)
{
    float total = 0.0, amplitude = 1.0;
    for (int i = 0; i <5; i++)
    {
        total += noise(n) * amplitude;
        n += n*1.7;
        amplitude *= 0.47;
    }
    return total;
}

void main()
{
    vec2 speed = vec2(0.1, 0.9);
    float shift = 1.327+sin(u_time*2.0)/2.4;
    float alpha = 1.0;

    vec2 uv = v_texcoord.xy;

    vec2 po = v_texcoord.xy * 2.0;
    vec2 filtpo = abs(vec2(1.0, 1.0) - po);

    //color_out = vec4(filtpo.x, filtpo.y, 0.0, alpha); return;

    // flame + 'cracked earth' texture.
    // This makes the whole thing a LOT more interesting
    //vec2 p =  + filtpo;
    vec2 p = 0.5 * texture2D(u_tex1,uv).xy + filtpo;

    // just the flame
    //vec2 p = filtpo;

    // This adds a 'pulsating wave' effect
    // p.y -= sin(u_time/1.1) / 3.0 + cos(u_time*2.1) / 5.0;
    // p.y /= 2.0;
    //color_out = vec4(p.x, p.y, 0.0, alpha); return;

    // Mad plasma noise functions...
    float q = fbm(p - u_time * 0.3+1.0*sin(u_time+0.5)/2.0);
    float qb = fbm(p - u_time * 0.4+0.1*cos(u_time)/2.0);
    float q2 = fbm(p - u_time * 0.44 - 5.0*cos(u_time)/2.0) - 6.0;
    float q3 = fbm(p - u_time * 0.9 - 10.0*cos(u_time)/15.0)-4.0;
    float q4 = fbm(p - u_time * 1.4 - 20.0*sin(u_time)/14.0)+2.0;
    q = (q + qb - .4*q2 -2.0*q3  + .6*q4)/2.8;

    // raw animated gradient
    vec2 r = vec2(fbm(p + q /2.0 + u_time * speed.x - p.x - p.y), fbm(p + q - u_time * speed.y));
    //color_out = vec4(r.x, r.y, 0.0, alpha); return;

    // color mapping / palette swaps

    vec3 colorFlames=vec3(1.0,.2,.05)/(pow((r.y+r.y)* max(.0,p.y)+0.1, 4.0));
    //color_out = vec4(colorFlames.x, colorFlames.y, colorFlames.z, alpha); return;

    vec3 colorFlamesAdjusted = colorFlames/(1.0+max(vec3(0),colorFlames));
    //color_out = vec4(colorFlamesAdjusted.x, colorFlamesAdjusted.y, colorFlamesAdjusted.z, alpha); return;

    vec3 colorWithBackground = colorFlames + (texture2D(u_tex0,uv*0.6+vec2(.5,.1)).xyz*0.01*pow((r.y+r.y)*.65,5.0)+0.055)*mix( vec3(.9,.4,.3),vec3(.7,.5,.2), uv.y);
    //color_out = vec4(colorWithBackground.x, colorWithBackground.y, colorWithBackground.z, alpha);

    vec3 colorWithBackgroundAdjusted = colorWithBackground/(1.0+max(vec3(0),colorWithBackground));
    color_out = vec4(colorWithBackgroundAdjusted.x, colorWithBackgroundAdjusted.y, colorWithBackgroundAdjusted.z, alpha);

}
