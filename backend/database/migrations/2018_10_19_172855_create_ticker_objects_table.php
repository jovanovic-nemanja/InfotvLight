<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTickerObjectsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('ticker_objects', function (Blueprint $table) {
            $table->increments('id')->unsigned();
            $table->integer('type')->unsigned();
            $table->foreign('type')->references('id')->on('ticker_object_type')->onDelete('cascade');
            $table->text('text')->nullable();
            $table->integer('positionX');
            $table->integer('positionY');
            $table->integer('width')->unsigned();
            $table->integer('height')->unsigned();
            $table->string('font')->default('verdana.ttf');
            $table->integer('fontsize')->unsigned()->default(12);
            $table->integer('animationspeed')->unsigned()->default(2);
            $table->integer('group_id')->unsigned();
            $table->foreign('group_id')->references('id')->on('ticker_group')->onDelete('cascade');
            $table->string('fontcolor')->default('255,255,255');
            $table->integer('order_number')->unsigned()->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tickers');
    }
}
