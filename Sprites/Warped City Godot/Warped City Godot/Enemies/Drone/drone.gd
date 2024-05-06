extends Area2D

var direction = -1
var speed = 80


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	global_position.x += speed * delta * direction
	
	
func turn_around():
	direction *= -1
