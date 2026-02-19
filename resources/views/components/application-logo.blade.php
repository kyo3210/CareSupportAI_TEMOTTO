@props(['size' => '100px'])

<img src="{{ asset('images/TEMOTTO_new.png') }}" {{ $attributes->merge(['style' => "height: $size; width: auto;"]) }} alt="ロゴ">