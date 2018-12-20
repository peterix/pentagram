uniform float u_time;
uniform vec2 u_resolution;

uniform sampler2D u_tex0;
uniform vec2 u_tex0Resolution;

uniform sampler2D u_tex1;
uniform vec2 u_tex1Resolution;

in vec2 v_texcoord;
varying out vec4 color_out;

uniform vec2 u_mouse;

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

vec4 aOverB(vec4 a,vec4 b)
{
    a.xyz*=a.w;
    b.xyz*=b.w;
    return vec4(a+b*(1.-a));
}

void main()
{
    vec2 speed = vec2(0.1, 0.9);
    float shift = 1.327+sin(u_time*2.0)/2.4;
    float alpha = 1.0;

    vec2 uv = v_texcoord.xy;

    // radial gradient function
    vec2 displacement = vec2( uv.x - 0.5,  uv.y - 0.5);
    float distance = sqrt( dot(displacement, displacement) );

    // magical fudge factor
    vec2 po = vec2(distance / fbm(displacement - u_time * 0.03), fbm(displacement + u_time *0.05 ) - 0.6);
    //color_out = vec4(po.x, po.y, 0.0, 1.0); return;

    float flame_alpha = clamp(2.0* (1.0 - texture2D(u_tex1,uv).x), 0.0, 1.0);
    float bg_alpha = texture2D(u_tex1,uv).x;
    float intensity = u_mouse.y / u_resolution.y * 0.7;

    // Adding the pentagram here guides the flames
    vec2 p = 0.5 * texture2D(u_tex1,uv).xy + po * intensity;

    // modulate result by intensity
    p.y /= intensity;
    //color_out = vec4(p.x, p.y, 0.0, 1.0); return;

    // Mad plasma noise functions...
    float q = fbm(p - u_time * 0.3+1.0*sin(u_time+0.5)/2.0);
    float qb = fbm(p - u_time * 0.4+0.1*cos(u_time)/2.0);
    float q2 = fbm(p - u_time * 0.44 - 5.0*cos(u_time)/2.0) - 6.0;
    float q3 = fbm(p - u_time * 0.9 - 10.0*cos(u_time)/15.0)-4.0;
    float q4 = fbm(p - u_time * 1.4 - 20.0*sin(u_time)/14.0)+2.0;
    q = (q + qb - .4*q2 -2.0*q3  + .6*q4)/2.8;

    // raw animated gradient
    vec2 r = vec2(fbm(p + q /2.0 + u_time * speed.x - p.x - p.y), fbm(p + q - u_time * speed.y));
    //color_out = vec4(r.x, r.y, 0.0, 1.0); return;

    // color mapping / palette swaps

    vec3 colorFlames=vec3(1.0,.2,.05)/(pow((r.y+r.x)* max(.0,p.y)+0.1, 4.0));
    //color_out = vec4(colorFlames.x, colorFlames.y, colorFlames.z, flame_alpha); return;

    //vec3 colorFlamesAdjusted = colorFlames/(1.0+max(vec4(0),colorFlames));
    //color_out = vec4(colorFlamesAdjusted.x, colorFlamesAdjusted.y, colorFlamesAdjusted.z, flame_alpha); return;

    color_out = aOverB(vec4(colorFlames,flame_alpha), texture2D(u_tex0,uv) * min(texture2D(u_tex1,uv) / 2.0, vec4(1.0, 1.0, 1.0, 1.0)));

    //vec3 colorWithBackgroundAdjusted = colorWithBackground/(1.0+max(vec3(0),colorWithBackground));
    //color_out = vec4(colorWithBackgroundAdjusted.x, colorWithBackgroundAdjusted.y, colorWithBackgroundAdjusted.z, 1.0);

}
